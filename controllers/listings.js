const Listing = require("../models/listing.js");
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeoCoding({ accessToken: mapToken });

module.exports.index =async (req, res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListings = async (req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id)
    .populate({
        path :"reviews",
        populate: { path: "author" }}).populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    // console.log(listing);
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing =  async (req, res, next)=>{
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
    .send();
    
    let url = req.file.path;
    let filename= req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.hostname = req.body.listing.hostname; // Corrected to req.body.listing.hostname
    newListing.hostnumber = req.body.listing.hostnumber;
    newListing.image = {url, filename};
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async(req, res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl =originalImageUrl.replace( "/upload", "/upload/w_250/");
    res.render("listings/edit.ejs",{listing, originalImageUrl});
};

module.exports.updateListing = async(req, res)=>{
    let {id}= req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
       let url = req.file.path;
       let filename= req.file.filename;
       listing.image = {url, filename};
       await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing =  async(req, res)=>{
    let {id}=req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};

// module.exports.searchListing = async (req, res) => {
//     const query = req.query.query;

//     try {
//         // Find the listing by title
//         const listing = await Listing.findOne({ title: query });

//         if (listing) {
//             // Redirect to the listing's show page
//             res.redirect(`/listings/${listing._id}`);
//         } else {
//             // If no listing is found, redirect back with an error message
//             req.flash('error', 'Listing not found');
//             res.redirect('/listings');
//         }
//     } catch (err) {
//         console.error(err);
//         req.flash('error', 'Something went wrong');
//         res.redirect('/listings');
//     }
// };