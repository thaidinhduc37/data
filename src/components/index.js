// components/index.js - Export all reusable components

// Layout components
import Button from './Button/Button';
import Card from './Card/Card';
import Input from './Input/Input';
// UI components
export { default as Button } from './Button/Button';
export { default as Card } from './Card/Card';
export { default as Input } from './Input/Input';

// Additional components that could be added:
// export { default as Modal } from './Modal/Modal';
// export { default as Table } from './Table/Table';
// export { default as Loading } from './Loading/Loading';
// export { default as Alert } from './Alert/Alert';
// export { default as Badge } from './Badge/Badge';
// export { default as Dropdown } from './Dropdown/Dropdown';
// export { default as Tabs } from './Tabs/Tabs';
// export { default as Pagination } from './Pagination/Pagination';

// Component groups for easier imports
export const UI = {
  Button,
  Card,
  Input
};


// Re-export sub-components


// Make sub-components available
Button.Group = Button.Group;
Card.Stat = Card.Stat;
Input.Textarea = Input.Textarea;
Input.Select = Input.Select;