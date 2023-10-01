# Link

This component displays either a http link (with the a tag) or a router link.

## Usage

```jsx
<Link href="//">My link</Link>
```

## Props

| Name     | Type   | Required | Default | Description                                               |
| -------- | ------ | -------- | ------- | --------------------------------------------------------- |
| external | bool   |          |         | Set to true to open the href link in a new tab            |
| href     | string |          |         |                                                           |
| to       | string |          |         |                                                           |
| RLink    | node   |          |         | The react-router Link component to use for app navigation |
