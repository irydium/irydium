# MyST markdown primitives

In addition to code cells, Irydium provides the note and warning directives from the [myst markdown format].
Support for more directives is tracked in [irydium/irydium#123].

```{note}
This is an exciting note!
```

```{warning}
This is a warning! It means be careful!
```

There is also preliminary support for [panels]. Here's a few examples:

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
This is a panel with only a body and footer.
+++
Footer
```

Panel contents can also styled using Bootstrap [styles]. Styles can be applied for all cards or on a per card basis.

```{panels}
:body: text-center
:header: bg-warning
This is a header styled based on panel styling.
^^^
This is a body styled based on panel styling.
+++
This is a footer
---
:column: col-lg-4 col-md-4 col-sm-4 col-xs-6 
:card: shadow
:header: bg-info p-4
:body: text-justify
:footer: text-center
This is a header styled based on card styling.
^^^
This is a card and body styled based on card styling.
+++
This is a footer styled based on card styling.
---
:body: text-danger
This is a header styled based on panel styling.
^^^
This is a body styled based on card styling.
---
This is a body styled based on panel styling.
```





[myst markdown format]: https://myst-parser.readthedocs.io/en/latest/index.html
[irydium/irydium#123]: https://github.com/irydium/irydium/issues/123
[panels]: https://jupyterbook.org/content/content-blocks.html#panels
[styles]: https://getbootstrap.com/docs/5.1/components/card/