---
to: <%= h.daLib(name) %>/.babelrc
---
{
  "presets": [
    [
      "@nx/react/babel",
      {
        "runtime": "automatic",
        "useBuiltIns": "usage"
      }
    ]
  ],
  "plugins": []
}
