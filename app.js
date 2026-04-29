const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const listingSchema = require("./schema.js");

// =======================
// DB CONNECTION
// =======================
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to DB");
}
main().catch(err => console.log(err));

// =======================
// APP CONFIG
// =======================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// =======================
// VALIDATION MIDDLEWARE
// =======================
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);

    if (error) {
        const errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();

    }
};

// =======================
// ROUTES
// =======================

// Root
app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

// INDEX
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// NEW
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// SHOW
app.get("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found!");
    }

    res.render("listings/show.ejs", { listing });
}));

// CREATE
app.post("/listings",
    validateListing,
    wrapAsync(async (req, res,next) => {
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    })
);

// EDIT
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found!");
    }

    res.render("listings/edit.ejs", { listing });
}));

// UPDATE
app.put("/listings/:id",
    validateListing,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        res.redirect(`/listings/${id}`);
    })
);

// DELETE
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

// =======================
// 404 HANDLER (FIXED)
// =======================
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// =======================
// ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
    if (err.name === "CastError") {
        err = new ExpressError(400, "Invalid ID");
    }

    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

// =======================
// SERVER
// =======================
app.listen(8080, () => {
    console.log("🚀 Server running on port 8080");
});