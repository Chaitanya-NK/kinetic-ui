# Props for core components

Generated from source. Everything else is documented at https://kinetic-ui.chaitanya-nk.com/components/<name>.

## button

**Button** (also accepts ButtonHTMLAttributes, HTMLAttributes)

- `variant?`: `"link" | "destructive" | "soft" | "outline" | "primary" | "secondary" | "ghost"`
- `size?`: `"sm" | "md" | "lg" | "icon" | "icon-sm"`
- `asChild?`: `boolean` = false. Render as the child element (e.g. a Next.js <Link>).
- `loading?`: `boolean` = false. Shows a spinner and disables the button.

## badge

**Badge** (also accepts HTMLAttributes)

- `variant?`: `"warning" | "info" | "success" | "danger" | "solid" | "soft" | "outline" | "neutral"`
- `size?`: `"sm" | "md" | "lg"`
- `dot?`: `boolean | "pulse"`. Show a status dot. `pulse` animates it.

## input

**Input** (also accepts InputHTMLAttributes, HTMLAttributes)

- `leading?`: `ReactNode`. Icon or text shown before the value.
- `trailing?`: `ReactNode`. Icon, text or button shown after the value.
- `invalid?`: `boolean`. Marks the field invalid and styles it red.
- `wrapperClassName?`: `string`. Class for the outer wrapper (border, size).

**Textarea** (also accepts TextareaHTMLAttributes, HTMLAttributes)

- `invalid?`: `boolean`
- `showCount?`: `boolean`. Show "used / max" under the field when maxLength is set.

**Field**

- `children`: `ReactNode`
- `label?`: `ReactNode`
- `hint?`: `ReactNode`
- `error?`: `ReactNode`
- `htmlFor?`: `string`
- `className?`: `string`

## select

**Select**

- `options`: `SelectOption[]`
- `value?`: `string`
- `defaultValue?`: `string`
- `onValueChange?`: `((value: string) => void)`
- `placeholder?`: `string` = "Select…"
- `disabled?`: `boolean`
- `invalid?`: `boolean`
- `className?`: `string`
- `contentClassName?`: `string`
- `name?`: `string`
- `aria-label?`: `string`
- `id?`: `string`

## checkbox

**Checkbox** (also accepts ButtonHTMLAttributes, HTMLAttributes)

- `label?`: `ReactNode`
- `description?`: `ReactNode`

## switch

**Switch** (also accepts ButtonHTMLAttributes, HTMLAttributes)

- `label?`: `ReactNode`
- `description?`: `ReactNode`

## radio-group

**Radio** (also accepts ButtonHTMLAttributes, HTMLAttributes)

- `label?`: `ReactNode`
- `description?`: `ReactNode`

**RadioCard** (also accepts ButtonHTMLAttributes, HTMLAttributes)

- `description?`: `ReactNode`
- `aside?`: `ReactNode`. Extra content, e.g. a price, on the right.

## slider

**Slider** (also accepts HTMLAttributes)

- `showValue?`: `boolean`. Show the value in a bubble above each thumb.
- `formatValue?`: `((value: number) => string)` = String

## tabs

**Tabs** (also accepts HTMLAttributes)

- `defaultValue`: `string`
- `value?`: `string`
- `onValueChange?`: `((value: string) => void)`
- `variant?`: `"pill" | "underline"` = "underline". underline: sliding underline. pill: sliding pill (segmented control).

**SegmentedControl**

- `options`: `{ value: string; label: ReactNode; }[]`
- `defaultValue`: `string`
- `value?`: `string`
- `onValueChange?`: `((value: string) => void)`
- `className?`: `string`
- `aria-label?`: `string`

## dialog

**DialogContent** (also accepts HTMLAttributes)

- `size?`: `"sm" | "md" | "lg" | "xl"` = "md"
- `hideClose?`: `boolean`. Hide the × button in the corner.

**SheetContent** (also accepts HTMLAttributes)

- `side?`: `"right" | "left" | "bottom"` = "right"

## popover

**PopoverContent** (also accepts HTMLAttributes)

- `arrow?`: `boolean` = false

## tooltip

**Tooltip**

- `content`: `ReactNode`
- `children`: `ReactNode`
- `shortcut?`: `string`. Keyboard shortcut shown on the right, e.g. "⌘ C".
- `side?`: `"right" | "left" | "bottom" | "top"` = "top"
- `delay?`: `number` = 300
- `className?`: `string`

## dropdown-menu

**DropdownMenuItem** (also accepts HTMLAttributes)

- `shortcut?`: `string`
- `destructive?`: `boolean`

**DropdownMenuSeparator**

- `className?`: `string`

## toast

**Toaster**

- `position?`: `"top-left" | "top-right" | "bottom-left" | "bottom-right" | "bottom-center" | "top-center"` = "bottom-right"
- `visible?`: `number` = 3. How many toasts are visible before they stack.
- `showProgress?`: `boolean` = true. Thin countdown bar along the bottom of each toast.

## card

**Separator** (also accepts HTMLAttributes)

- `orientation?`: `"horizontal" | "vertical"` = "horizontal"

## avatar

**Avatar**

- `src?`: `string`
- `alt?`: `string` = ""
- `fallback?`: `string`. Shown while the image loads or if it fails. Defaults to initials of `alt`.
- `size?`: `"sm" | "md" | "lg" | "xl"` = "md"
- `status?`: `"online" | "away" | "busy" | "offline"`
- `ring?`: `boolean`. Accent ring, e.g. for "has a new story".
- `color?`: `string`. Fallback background colour.
- `className?`: `string`

**AvatarStack**

- `avatars`: `AvatarProps[]`
- `max?`: `number` = 4. Show at most this many, then "+N".
- `size?`: `"sm" | "md" | "lg" | "xl"` = "md"
- `className?`: `string`

## combobox

**Combobox**

- `options`: `ComboboxOption[]`
- `placeholder?`: `string`
- `searchPlaceholder?`: `string`
- `emptyText?`: `string`
- `onCreate?`: `((label: string) => void)`. Show "Create “…”" when nothing matches. Called with the typed text.
- `disabled?`: `boolean`
- `className?`: `string`
- `aria-label?`: `string`
- `multiple?`: `boolean`
- `value?`: `string | string[]`
- `onValueChange?`: `((value: string) => void) | ((value: string[]) => void)`
- `defaultValue?`: `string | string[]`

## data-table

**DataTable**

- `data`: `T[]`
- `columns`: `DataTableColumn<T>[]`
- `getRowId`: `(row: T) => string`. Unique id per row.
- `searchable?`: `boolean` = true. Show a search box that filters across columns.
- `searchPlaceholder?`: `string` = "Search…"
- `selectable?`: `boolean`. Row checkboxes plus a bulk-action bar.
- `bulkActions?`: `((selected: T[], clear: () => void) => ReactNode)`
- `pageSize?`: `number` = 8
- `toolbar?`: `ReactNode`. Extra controls next to the search box.
- `emptyMessage?`: `ReactNode` = "No results."
- `onRowClick?`: `((row: T) => void)`
- `className?`: `string`

## command-palette

**CommandPalette**

- `items`: `CommandItem[]`
- `open?`: `boolean`
- `onOpenChange?`: `((open: boolean) => void)`
- `placeholder?`: `string` = "Search or run a command…"
- `hotkey?`: `boolean` = true. Open with ⌘K / Ctrl+K. Default true.
- `emptyText?`: `string` = "No results."

## progress

**Progress** (also accepts HTMLAttributes)

- `value?`: `number`. 0–100. Leave undefined for an indeterminate bar.
- `label?`: `ReactNode`
- `showValue?`: `boolean`
- `size?`: `"sm" | "md" | "lg"` = "md"
- `striped?`: `boolean`

**ProgressRing**

- `value`: `number`
- `size?`: `number` = 72
- `thickness?`: `number` = 6
- `label?`: `ReactNode`. Text in the middle. Defaults to the percentage.
- `color?`: `string` = "var(--kn-accent)"
- `className?`: `string`

## alert

**Alert** (also accepts HTMLAttributes)

- `tone?`: `"warning" | "info" | "success" | "danger"` = "info"
- `action?`: `ReactNode`. Buttons or links on the right.

**EmptyState**

- `title`: `ReactNode`
- `icon?`: `ReactNode`
- `description?`: `ReactNode`
- `actions?`: `ReactNode`
- `className?`: `string`
