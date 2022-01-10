### ACT

```sh
act -P ubuntu-latest=node:16 --secret-file ./.act/.secrets -e ./.act/event.pull_request.json -j release-management -v
```
