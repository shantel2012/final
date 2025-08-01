const express = require('express');
const router = express.Router();
const parkingLotController = require('../controllers/parkingLotController');

// CREATE - Add new parking lot (Owner/Admin only)
router.post('/', parkingLotController.createParkingLot);

// READ - Get all parking lots (with filters)
router.get('/', parkingLotController.getAllParkingLots);

// READ - Get parking lots owned by current user
router.get('/my-lots', parkingLotController.getMyParkingLots);

// READ - Get single parking lot by ID
router.get('/:id', parkingLotController.getParkingLotById);

// READ - Get parking lot statistics
router.get('/:id/stats', parkingLotController.getParkingLotStats);

// UPDATE - Update parking lot (Owner/Admin only)
router.put('/:id', parkingLotController.updateParkingLot);

// DELETE - Delete/Deactivate parking lot (Owner/Admin only)
router.delete('/:id', parkingLotController.deleteParkingLot);

module.exports = router;