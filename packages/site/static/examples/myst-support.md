# MyST markdown primitives

In addition to code cells, Irydium provides the note and warning directives from the [myst markdown format].
Support for more directives is tracked in [irydium/irydium#123].

```{note}
This is an exciting note!
```

```{warning}
This is a warning! It means be careful!
```

```{panels}
This is a header
^^^
This is a body
+++
This is a footer
---
This is a new panel with no header or footer
---
Header
^^^
This is a panel with only a header and body
---
This is a panel with only a body and footer
+++
Footer
```
[myst markdown format]: https://myst-parser.readthedocs.io/en/latest/index.html
[irydium/irydium#123]: https://github.com/irydium/irydium/issues/123
