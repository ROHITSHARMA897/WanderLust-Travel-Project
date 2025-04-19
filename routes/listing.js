const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isloggedIn, isOwner, validateListing} = require("../middleware.js");
const listingControllers = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
.get(wrapAsync( listingControllers.index ))
.post(
     isloggedIn, 
     upload.single("listing[image]"), 
     validateListing,
     wrapAsync(listingControllers.createListing )
    );

//new route
router.get("/new", isloggedIn, listingControllers.renderNewForm);

router.route("/:id")
.get(wrapAsync( listingControllers.showListings))
.put( isloggedIn, isOwner, upload.single("listing[image]"), validateListing,wrapAsync( listingControllers.updateListing))
.delete( isloggedIn, isOwner, wrapAsync(listingControllers.destroyListing));

//edit route 
router.get("/:id/edit", isloggedIn, isOwner, wrapAsync( listingControllers.renderEditForm));

module.exports = router;