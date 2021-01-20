+++
title = "Getting fired with Github Actions!"
date = 2021-01-20

[taxonomies]
tags = ["DevOps", "Github"]
+++

Can your repository secrets be logged with Github Actions? A guide on trying
not to get sued and/or fired!

<!-- more -->

While migrating travis CI to github actions, I wanted to test whether/when the 
[secrets on a repository](https://docs.github.com/en/actions/reference/encrypted-secrets)
get logged.

# Set some secrets
I created an empty repository and set up some secrets (_Settings > Secrets >
New repository secret_):
  
* NEVER_SEE_TOKEN, with value "SEENO EVIL".
* ECHOED_TOKEN, with value "echoed":

# Good usage: the command success
My very first attempt was running a command using the secret properly. Here, it is
expected that github will hide the secret variables.

```yaml
name: secret

on:
  push:
    branches:
    - master

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - name: Check successful action with secret is not logged and works
      run: echo ${{ secrets.NEVER_SEE_TOKEN }} | grep "SEENO"
```

Let's check the log!

```text
> Check successful action with secret is not logged and works

Run echo *** | grep "SEENO"
  echo *** | grep "SEENO"
  shell: /bin/bash -e {0}
***
```

Fantastic, exactly how it should be.

# Strange usage: echoing the secrets
Let's add another step, echoing the secret to `STDOUT`. 

```yaml
- name: Echoed secrets are not logged!
      run: echo ${{ secrets.ECHOED_TOKEN }}
```

Log:

```text
> Echoed secrets are not logged!

Run echo ***
  echo ***
  shell: /bin/bash -e {0}
***
```

In this case, github actions saves us from doomsday but we are really flexing
our madness here. Nonetheless, if you really want the secret to be printed (maybe
for debugging) you may use [the workaround posted here](https://www.theserverside.com/blog/Coffee-Talk-Java-News-Stories-and-Opinions/GitHub-Actions-Secrets-Example-Token-Tutorial)

```yaml
- name: This is going to be printed!
  run: echo ${{secrets.SECRET_TOKEN}} | sed 's/./& /g' 
```

# Still good usage: the command fails but syntax is fine
If one job failed, the secrets should not be printed, right?

```yaml
test-bad:
    runs-on: ubuntu-latest
    steps:
    - name: Check unsuccessful action with secret is not logged and works
      run: echo ${{ secrets.NEVER_SEE_TOKEN }} | grep "GOOD"
```
Log:
```
> Check unsuccessful action with secret is not logged and works
Run echo *** | grep "GOOD"
  echo *** | grep "GOOD"
  shell: /bin/bash -e {0}
Error: Process completed with exit code 1.
```
Right!

# Bad usage: the command fails because of wrong syntax
This is when you get fired. If a command is called using the wrong syntax (or 
your secret refers to what should be a file but it isn't, like in this case) the error trace of the
command might reveal the secrets, letting them exposed to the whole Internet.

```yaml
tests-bad-syntax:
    runs-on: ubuntu-latest
    steps:
    - name: Check unsuccessful action with secret is logged and fails
      run: grep "JULY" ${{ secrets.NEVER_SEE_TOKEN }}
```

Log:

```
> Check unsuccessful action with secret is logged and fails
Run grep "JULY" ***
  grep "JULY" ***
  shell: /bin/bash -e {0}
grep: SEENO: No such file or directory
grep: EVIL: No such file or directory
```

## How to fix this situation
At least the first time using an action of this kind, we could redirect the
`STERR` to `/dev/null`. Thus, the possible stack of errors will be removed
from the logs.

```yaml
  tests-bad-syntax-recovered:
    runs-on: ubuntu-latest
    steps:
    - name: Check unsuccessful action with wrong syntax and secret is not logged
      run: grep "JULY" ${{ secrets.NEVER_SEE_TOKEN }} 2> /dev/null
```

Log:

```
> Check unsuccessful action with wrong syntax and secret is not logged
Run grep "JULY" *** 2> /dev/null
  grep "JULY" *** 2> /dev/null
  shell: /bin/bash -e {0}
Error: Process completed with exit code 2.
```

Yay! Another way would be to _maybe_ try the commands locally. Just maybe.
