# Mannum Maramum Iyakkam — Website

A bilingual (Tamil/English) React + Tailwind CSS website for Mannum Maramum Iyakkam.

## Run it locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Build for production

```bash
npm run build
```

Output goes to the `dist/` folder — upload that to any static host (Netlify, Vercel, GitHub Pages, your own server, etc).

## Project structure

```
src/
  i18n.jsx            → All English/Tamil website copy lives here. Edit this file to change any text.
  App.jsx             → Assembles every section in order.
  index.css           → Tailwind + global styles.
  components/
    Navbar.jsx              Sticky nav + language switcher
    Hero.jsx                Home hero with tree illustration
    ImpactStats.jsx         14L+ seeds / 42,500+ trees stat bar
    About.jsx                Vision, mission, values
    Activities.jsx           Documented org activities
    GenZNatureExperience.jsx "Go Green – Live Nature" section
    ActivityRegistration.jsx Join-an-activity form (proposed feature)
    ActivityProof.jsx        Upload activity proof form (proposed feature)
    GreenPoints.jsx           Green Points / badges (proposed feature)
    Impact.jsx               Project highlight tags
    Projects.jsx              Individual project write-ups
    PalmTrees.jsx             Educational palm-tree page
    Locations.jsx             Plantation location tags
    Team.jsx                  Team pipeline (Trichy team doc)
    Awards.jsx                 Awards & recognition
    Gallery.jsx                Photo placeholder grid
    UpcomingProjects.jsx       Planned projects
    JoinUs.jsx                Volunteer / Support / Propagate
    Contact.jsx                Org contact details
    Footer.jsx
```

## What's real vs. proposed

Everything under **Activities, Impact, Projects, Palm Trees, Locations, Team, Awards, Upcoming Projects, Contact** is taken directly from the organization's own PDFs — no invented facts, numbers, or names.

**Activity Registration, Activity Proof, and Green Points** are marked in the UI as *proposed* features — they currently just show a success message in the browser and don't send data anywhere. To make them real, you'd wire the form's `onSubmit` in each component to your backend, a form service (e.g. Formspree, Google Forms), or a database (e.g. Firebase, Supabase).

## Adding real photos

Replace the placeholder tiles in `Gallery.jsx` with `<img>` tags pointing at your event photos once you have them (e.g. in a `public/images/` folder).

## Editing text

Everything you see on the site — English and Tamil — is in **`src/i18n.jsx`**. Find the section you want to change (they're grouped by section name, matching the components) and edit the `en` / `ta` values directly.
