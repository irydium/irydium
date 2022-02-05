# Contributing to Irydium

Thank you for your interest in contributing to Irydium! This
document tries to codify some best practices for contribution to this
repository.

## Participation guidelines

All communication (on the chat channels, on mailing lists, and in
pull requests and issues) is expected to follow the Irydium code
of conduct. For more information, see the [code of conduct document](./CODE_OF_CONDUCT.md)
in the root of this repository.

## Getting in touch

If you have questions about Irydium, the easiest way to get in touch with the maintainers
is via the Irydium community chat, accessible either via Gitter or Matrix:

- [irydium/community](https://gitter.im/irydium/community) (Gitter)
- [#irydium_communty:gitter.im](https://matrix.to/#/#irydium_community:gitter.im) (Matrix)

## Filing issues

File an issue if you have a bug report or feature request that you (personally)
do not intend to work on right away _or_ you would like additional feedback on
your approach before starting implementation work. If you found a bug (or small
missing feature) and you want to start implementing it immediately (or already
have a solution), go ahead and skip straight to making a pull request (see
below).

To help with triage, issues should have a descriptive title. Examples of good
issue titles:

- Add a link to Matrix channel on front page
- Irydium should support real-time collaborative editing

In the issue itself, provide as much information as necessary to help someone
reading it understand the nature of the problem (and provide feedback). For
examples of this, look at some of the
[fixed issues](https://github.com/irydium/irydium/issues?q=is%3Aissue+is%3Aclosed)
filed by the project maintainers.

## Opening pull requests

Like issues, pull requests should have a descriptive title to help with triage.
However there are two things that are different:

- Instead of pointing out a problem, they should describe the solution
- If a pull request fixes a specific issue, the title should specify
  `(fixes #X)` (where X refers to the issue number)

For example, a pull request to fix an issue entitled "Storybook doesn't render
components with styling" could be named "Render storybook components with
styling (fixes #1234)".

As much as possible, each pull request should attempt to solve _one problem_.
For logically separate changes, file multiple PRs.

Make sure that the pull request passes continuous integration (including linter
errors) and that there are no merge conflicts before asking for review. If you
want some feedback on a work-in-progress (where these conditions are not yet
met), mark your pull request as a draft.

## Adding changesets

Pull requests that make changes to the irydium compiler or viewer should
include a [changeset] (as the site is not distributed on npm, we don't both
versioning it, same with documentation updates).
After making a change, summarize the changes by running `npx changeset`.
As far as changeset content is concerned, you should just copy the commit message above in most cases.

As far as versioning is concerned, irydium is currently considered _highly unstable_
so you can just use a micro version bump for whatever package your change affects:
either the irydium compiler, viewer, or both.

[changeset]: https://github.com/changesets/changesets
