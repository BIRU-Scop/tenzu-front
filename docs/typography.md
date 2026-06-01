reference documentation : https://material.angular.dev/guide/theming-your-components

## M3 hierarchy (`mat.typography-hierarchy`)

| M3 level | M3 class | Styled tag | `--mat-sys-*` token |
|---|---|------------|---|
| display-large | `.mat-display-large` | `<h1>`     | `--mat-sys-display-large` |
| display-medium | `.mat-display-medium` | `<h2>`     | `--mat-sys-display-medium` |
| display-small | `.mat-display-small` | `<h3>`     | `--mat-sys-display-small` |
| headline-large | `.mat-headline-large` | `<h4>`     | `--mat-sys-headline-large` |
| headline-medium | `.mat-headline-medium` | `<h5>`     | `--mat-sys-headline-medium` |
| headline-small | `.mat-headline-small` | `<h6>`     | `--mat-sys-headline-small` |
| title-large | `.mat-title-large` | -          | `--mat-sys-title-large` |
| title-medium | `.mat-title-medium` | -          | `--mat-sys-title-medium` |
| title-small | `.mat-title-small` | -          | `--mat-sys-title-small` |
| body-large | `.mat-body-large` | -          | `--mat-sys-body-large` |
| body-medium | `.mat-body-medium` | -          | `--mat-sys-body-medium` |
| body-small | `.mat-body-small` | -          | `--mat-sys-body-small` |
| label-large | `.mat-label-large` | -          | `--mat-sys-label-large` |
| label-medium | `.mat-label-medium` | -          | `--mat-sys-label-medium` |
| label-small | `.mat-label-small` | -          | `--mat-sys-label-small` |

Each token also has its decomposed sub-tokens: `--mat-sys-<level>-font`, `-size`,
`-line-height`, `-tracking`, `-weight` (e.g. `--mat-sys-body-large-size`).

## M3 utility classes (`mat.system-classes`)

```
.mat-font-display-{lg,md,sm}
.mat-font-headline-{lg,md,sm}
.mat-font-title-{lg,md,sm}
.mat-font-body-{lg,md,sm}
.mat-font-label-{lg,md,sm}
```
