mgreel.js web
=============

> This fork is a web port of the [original Node script](https://github.com/olt/mgreel).

A web app to convert one or more Wave files to a
single Make Noise Morphagene reel (32bit/48khz/stereo).

All files are concatenated and splice markers are set at the end of each
input files. Mono Wave files are converted to stereo.


Requirements
------------

- Install [Node.js](https://nodejs.org)
- Download this repository and change to this directory
- Build the JavaScript bundle by running `npm install && npm run build`
- Open `index.html` in your browser


License
-------

Copyright 2020 Oliver Tonnhofer, Lorenzo Stanco

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
