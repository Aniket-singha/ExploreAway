const express = require('express');
const authController = require('./../controllers/authController.js');
// const reviewController=require('./../controllers/reviewController')

const tourController = require('./../Controllers/tourController');
const reviewRouter = require('./reviewRoutes');
const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);
//this means that for this specific url use the review router instead

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTour, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
// tou

router.param('id', tourController.checkId);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );
// router.route('/:tourId/reviews').post(authController.protect,reviewController.createReviews)

module.exports = router;
