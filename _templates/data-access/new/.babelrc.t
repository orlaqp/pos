---
to: <%= h.daLib(name) %>/.babelrc
---
{
  "presets": [
    [
      "@nrwl/react/babel",
      {
        "runtime": "automatic",
        "useBuiltIns": "usage"
      }
    ]
  ],
  "plugins": []
}
