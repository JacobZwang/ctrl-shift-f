# ctrl-shift-f (for chrome)
![ctrl-shift-f demo](ctrl-shift-f-demo.png)

> Bon Voyage Hacks II

> LaunchHacks

## Inspiration
Navigating around a single web page on chrome for something you've seen before is very easy using ctrl-f (cmd-f on mac). You just start typing what you want to go and then let the browser take you there. This works great unless you're looking for something that isn't on the page you're currently on. This got me thinking. If the browser is already caching other pages you've been to, why not just search through those as well?

## What it does
You press ctrl-shift-f (cmd-shift-f on mac) and a drop-down similar to chrome's native finder appears. You type what you're looking and you'll see results come up from pages you've already been to (after installation).

## How I built it
Although I'd love to have natively implemented this feature into the chromium project, that is above the scope of a weekend hackathon. I implemented this using a Chrome Extension. Unfortunately, Chrome does not allow extensions access to the raw HTTP cache, so I had to implement my own cache system in IndexedDB. The extension runs in the background of every page, makes a copy of the text content, and stores it for searching later.

## Challenges I ran into
Chrome puts limitations on how much data an extension can use. My extension gets around this by using an IndexedDB for each origin, meaning it takes up their data quota, not mine.

## Accomplishments that I'm proud of
Despite struggling to initially figure out what to build this weekend, once I had chosen this project, with less than 24 hours left, I was able to complete the project. It is fully functional and already of use to me.

## What I learned
First time using IndexedDB; Wasn't expecting it to be so much more complicated than local storage.

## What's next for ctrl-shift-f
### Client-side Crawling
The browser can do some simple crawling to index pages that you haven't visited yet for your searches.
### More Efficent Indexing & Search
Currently, I am not doing any sort of tokenization or keyword indexing. The text content of a page is simply stored by it's path and all pages of that origin are searched from start to end.
### Security
There are things that you probably don't want to be stored in plain text. Like your banking information. There should be measure put into place to avoid this automatically or at least allow manual configuration.
### Data Updates
Elegantly handle updates to page that's already been store.
### Query Optimization
Pages are currently stored based on path, but some sites may use queries as paths.