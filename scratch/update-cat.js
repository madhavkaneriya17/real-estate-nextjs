const fs = require("fs");
const cat = JSON.parse(fs.readFileSync("data/categories.json", "utf8"));

// coastal-haven
if (!cat["coastal-haven"].secondMarquee) cat["coastal-haven"].secondMarquee = ["Coastal Haven", "Waterfront Residences", "Coastal Haven", "Private Marina Living"];
if (!cat["coastal-haven"].whyInvestQuote.image) cat["coastal-haven"].whyInvestQuote.image = "/assets/BTS-1.avif";
if (!cat["coastal-haven"].cta) cat["coastal-haven"].cta = { titleLine1: "Secure Your Waterfront", titleLine2: "Sanctuary Today", buttonText: "Speak With Us", buttonLink: "/contact" };

// serene-greens
if (!cat["serene-greens"].secondMarquee) cat["serene-greens"].secondMarquee = ["Serene Greens", "Golf & Nature", "Serene Greens", "Forest Oasis"];
if (!cat["serene-greens"].whyInvestQuote.image) cat["serene-greens"].whyInvestQuote.image = "/assets/selection/evergreen/evergreen-big-image.avif";
if (!cat["serene-greens"].cta) cat["serene-greens"].cta = { titleLine1: "Find Your Sanctuary in", titleLine2: "Serene Greens", buttonText: "Speak With Us", buttonLink: "/contact" };

// urban-luxe
if (!cat["urban-luxe"].secondMarquee) cat["urban-luxe"].secondMarquee = ["Urban Luxe", "City Sophistication", "Urban Luxe", "Downtown Living"];
if (!cat["urban-luxe"].whyInvestQuote.image) cat["urban-luxe"].whyInvestQuote.image = "/assets/urban-living-card-cover.avif";
if (!cat["urban-luxe"].cta) cat["urban-luxe"].cta = { titleLine1: "Experience The Rhythm", titleLine2: "Of Urban Luxe", buttonText: "Speak With Us", buttonLink: "/contact" };

// limited-edition
if (!cat["limited-edition"].secondMarquee) cat["limited-edition"].secondMarquee = ["Limited Edition", "Landmark Living", "Limited Edition", "Rare Gems"];
if (!cat["limited-edition"].whyInvestQuote.image) cat["limited-edition"].whyInvestQuote.image = "/assets/selection/raregems/square-rare-gems.avif";
if (!cat["limited-edition"].cta) cat["limited-edition"].cta = { titleLine1: "Acquire A Rare Gem", titleLine2: "Limited Edition", buttonText: "Speak With Us", buttonLink: "/contact" };

fs.writeFileSync("data/categories.json", JSON.stringify(cat, null, 2), "utf8");
console.log("Successfully enriched categories.json");
