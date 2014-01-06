# responsive-screenshots

A [PhantomJS](http://phantomjs.org/) script to create web screenshots at different viewport widths, as defined in a JSON config file.

## Usage

```
phantomjs screenshots.js example.json
```

By default the script will look for a configuration file named `config.json`. You can use a file with a different name by passing it as the first argument to the script.

## Configuration

### Basic example

The configuration file needs to contain an array of _sets_. A set consists of a URL, an ID and a number of viewport widths at which to take screenshots. For example:

```json
{
  "sets": [
    {
      "id": "bbc_homepage",
      "widths": [1008], 
      "url": "http://www.bbc.co.uk"
    },
    {
      "id": "bbc_weather_mobile",
      "widths": [240, 320, 400],
      "url": "http://m.bbc.co.uk/weather"
    }
  ]
}
```

Running the script with this configuration would create the following output files:

```
images
├── bbc_homepage
│   └── 1008.png
└── bbc_weather_mobile
    ├── 240.png
    ├── 320.png
    └── 400.png
```

### Set configuration options

The configuration options for `set` objects in the JSON configuration are:

* `id` String - used for the output directory name
* `url` String - URL of the page to be visited
* `widths` Array - list of viewport widths at which to take screenshots
* `cookies` Array - list of cookies to set before visiting the page (default `[]`)
* `height` Number - viewport height (default `1000`)
* `timeout` Number - time in milliseconds to wait after page load before taking a screenshot (to allow JS to finish running etc.) (default `500`)

Here's an example of a config file that makes use of all of the configuration options:

```json
{
  "sets": [
    {
      "id": "bbc_weather_mobile",
      "widths": [240, 320, 400],
      "url": "http://m.bbc.co.uk/weather",
      "height": 600,
      "timeout": 200,
      "cookies": [
        {
          "name": "ckns_policy",
          "value": "111",
          "domain": "bbc.co.uk"
        }
      ]
    }
  ]
}
```

### Shared configuration

If you want to share configuration for multiple sets (e.g. same widths, cookies etc.), you can define shared configuration in an `all` object in the JSON configuration:

```json
{
  "all": {
    "widths": [ 240, 400, 600, 768, 1008 ],
    "cookies": [
      {
        "name": "ckns_policy",
        "value": "111",
        "domain": "bbc.co.uk"
      }
    ],
    "timeout": 300,
    "height": 768
  },
  "sets": [
    {
      "id": "bbc_tv",
      "url": "http://www.bbc.co.uk/tv"
    },
    {
      "id": "bbc_one",
      "url": "http://www.bbc.co.uk/bbcone"
    }
  ]
}
```

The configuration options in the `all` section will be used for all of the `sets`.
