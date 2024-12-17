

const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Constants
const DEFAULT_PAGE_SIZE = 10;
const BASE_LOCALS = {
  siteName: 'SockTalk Blog',
  baseDescription: 'A community-driven blog for real conversations'
};

/**
 * Handles pagination calculation for blog posts
 * @param {number} page - Current page number
 * @param {number} totalCount - Total number of posts
 * @param {number} perPage - Items per page
 * @returns {Object} Pagination details
 */
const calculatePagination = (page, totalCount, perPage) => {
  const nextPage = parseInt(page) + 1;
  const hasNextPage = nextPage <= Math.ceil(totalCount / perPage);
  return {
    currentPage: page,
    nextPage: hasNextPage ? nextPage : null
  };
};

/**
 * GET /
 * Home page with paginated blog posts
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = DEFAULT_PAGE_SIZE;

    const [posts, totalCount] = await Promise.all([
      Post.aggregate([{ $sort: { createdAt: -1 } }])
        .skip(perPage * (page - 1))
        .limit(perPage)
        .exec(),
      Post.countDocuments()
    ]);

    const { currentPage, nextPage } = calculatePagination(page, totalCount, perPage);

    res.render('index', {
      locals: {
        title: BASE_LOCALS.siteName,
        description: BASE_LOCALS.baseDescription
      },
      data: posts,
      current: currentPage,
      nextPage,
      currentRoute: '/'
    });
  } catch (error) {
    console.error('Error in home route:', error);
    res.status(500).render('error', {
      message: 'Failed to load blog posts',
      currentRoute: '/error'
    });
  }
});

/**
 * GET /post/:id
 * Single post page
 */
router.get('/post/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).render('error', {
        message: 'Post not found',
        currentRoute: '/error'
      });
    }

    res.render('post', {
      locals: {
        title: post.title,
        description: BASE_LOCALS.baseDescription
      },
      data: post,
      currentRoute: `/post/${req.params.id}`
    });
  } catch (error) {
    console.error('Error in post route:', error);
    res.status(500).render('error', {
      message: 'Failed to load post',
      currentRoute: '/error'
    });
  }
});

/**
 * POST /search
 * Search functionality
 */
router.post('/search', async (req, res) => {
  try {
    const searchTerm = req.body.searchTerm;
    const sanitizedSearch = searchTerm.replace(/[^a-zA-Z0-9 ]/g, '');
    
    const searchResults = await Post.find({
      $or: [
        { title: { $regex: new RegExp(sanitizedSearch, 'i') }},
        { body: { $regex: new RegExp(sanitizedSearch, 'i') }}
      ]
    });

    res.render('search', {
      locals: {
        title: 'Search Results',
        description: `Search results for: ${searchTerm}`
      },
      data: searchResults,
      currentRoute: '/search'
    });
  } catch (error) {
    console.error('Error in search route:', error);
    res.status(500).render('error', {
      message: 'Search failed',
      currentRoute: '/error'
    });
  }
});

/**
 * GET /about 
 * About page
 */
router.get('/about', (req, res) => {
  res.render('about', {
    locals: {
      title: 'About SockTalk',
      description: 'Learn about our community and mission'
    },
    currentRoute: '/about'
  });
});

/**
 * GET /contact
 * Contact page
 */
router.get('/contact', (req, res) => {
  res.render('contact', {
    locals: {
      title: 'Contact Us',
      description: 'Get in touch with the SockTalk team'
    },
    currentRoute: '/contact'
  });
});

module.exports = router;