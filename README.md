ZeroNet Template
================

Template for creating and developing ZeroNet sites.

## Description

This project provides a template for creating and developing [ZeroNet][link-zeronet] sites.

It supports [NPM][link-npm] dependencies and it uses [Gulp][link-gulp] and [Browserify][link-browserify] for bundling scripts. It also supports [SASS][link-sass] and automatic deployments with [Travis CI][link-travis].

## Usage

### Requirements

You must have [Git][link-git] and [Node.js][link-nodejs] installed on your computer. It is recommended that use the latest versions.

It is also recommended to also install [Python][link-python] and [ZeroNet][link-zeronet] for easier developing and deploying. Currently, only Python 2.7 is supported but Python 3 version of ZeroNet is in development.

### Start

If you don't already have your own ZeroNet site, you should create it from ZeroNet. Details are available in [ZeroNet documentation][link-create-site]. You must have a site's address and a private key.

You can then clone or fork this repository and install dependencies. It already contains an example site and code with [ZeroFrame API][link-zeroframe-api].

```bash
$ git clone https://github.com/filips123/ZeroTemplate.git my-new-site
$ cd my-new-site
$ yarn
```

You should commit changes to `develop` branch.

### Development

#### Site dependencies and details

You should edit `package.json` to provide your own information and dependencies needed for your site.

It is also recommended to update `README.md` to provide information about your site. You can then edit the files and add your own code.

#### ZeroNet files

Each site must have valid `src/content.json`. Details about are it availible in [ZeroNet documentation][link-content-json].

You should copy `address` and `signers_sign` (and other keys related with addressed and signatures) from original `content.json` that was generated at site creation.

It is recommended that it doesn't contain `modified`, `files`, `files_optional` and `signs` because they will be auto-generated on each `siteSign`.

#### Other files

The site is contained in `src/` directory.

Scripts are stored in `src/js/` and each site must contain the main script (`src/js/index.js`). Styles are stored in `src/css/` and `src/sass`.

It is recommended that scripts follow Standard style. You can run linting with `yarn lint`. 

Your `index.html` (or any other HTML file) should include JS from `js/all.js?lang={lang}&site_modified={site_modified}` and CSS from `css/all.css?site_modified={site_modified}`. Additional query parameters will ensure that the files will be correctly updated.

### Deploying

#### Manual deployment

You can build the site with `yarn build`. This will bundle all scripts and styles and copy static files to `dist/`. You can then copy that directory to your site directory in ZeroNet, sign the changes and publish them.

#### Automatic deployment

After you finish your changes, you can run `yarn deploy`. This will automatically build, sign and publish your site which may take a few minutes.

Local Python copy of ZeroNet is required for this task. You must set a path to it (location of `zeronet.py` file) with `--zeronet`  argument.

```bash
$ yarn deploy --zeronet=/path/to/zeronet
```

During deploy, you will be asked for your site's private key. You must enter it to finish deploy.

You can also specify your private key with `--privkey` argument. Note that your private key will then be visible in command's output.

```bash
$ yarn deploy --zeronet=/path/to/zeronet --privkey=sEcReTkEy
```

#### Continuous deployment

You can also use continuous deployment with Travis CI.

During development, any changes must be committed to `develop` branch. When you want to release them, you will just have to merge it into `master` and publish the changes. Travis CI will then automatically install ZeroNet, sign the changes and publish your site.

To make this working, you will have to (securely) set `ZERONET_PRIVKEY` environment variable in Travis CI. It must contain your private key.

[link-zeronet]: https://zeronet.io/
[link-git]: https://git-scm.com/
[link-python]: https://www.python.org/
[link-nodejs]: https://nodejs.org/
[link-npm]: https://www.npmjs.com/
[link-gulp]: https://gulpjs.com/
[link-browserify]: http://browserify.org/
[link-sass]: https://sass-lang.com/
[link-travis]: https://travis-ci.com/

[link-create-site]: https://zeronet.io/docs/using_zeronet/create_new_site/
[link-zeroframe-api]: https://zeronet.io/docs/site_development/zeroframe_api_reference/
[link-content-json]: https://zeronet.io/docs/site_development/content_json/
