# Irydium components

Irydium allows users to define re-usable components that can be used to create multiple documents.
Components are defined inside irydium documents themselves!

The process for reusing a component is a two-step process.

## Defining the code chunk

First, define a code chunk with an identifier.
Here's an intentionally-trivial example (a simple JavaScript function):

```{code-cell} js
---
id: myFunction
inline: true
---
return (x) => x * 2
```

Then, add some documentation on how to use it.
In this case, we'll just calculate a value using the function and get its value.

```{code-cell} js
---
id: value
inputs: myFunction
inline: true
---
return myFunction(5)
```

We can then display the value (validating that this function works as expected) by referencing `{value}`:

{value}

## Use it in another document

Then, from another irydium document, import and use the component.
Here's a full example: copy and paste it into [the repl](/repl) if you want to see it in action.

````md
---
imports: https://irydium.dev/components/intro.md#myFunction
---

# Using myFunction

```{code-cell} js
---
id: value
inputs: myFunction
---
return myFunction(5)
```

{value}
````
