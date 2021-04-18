#!/bin/sh

# Wrapper script to make local dev workflows work as expected

exec ./bin/irmd-compile ../../$1
