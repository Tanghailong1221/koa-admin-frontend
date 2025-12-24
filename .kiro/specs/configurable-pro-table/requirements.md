# Requirements Document

## Introduction

本文档定义了一个完全可配置的 ProTable 组件的需求规范。该组件基于 Element Plus 的 el-table，提供高度灵活的配置能力，包括卡片头部、表格列、操作栏按钮、工具栏按钮等所有元素的可配置性。用户可以通过 props、插槽和方法来实现多样化的功能需求。

## Glossary

- **ProTable**: 基于 Element Plus el-table 封装的高级表格组件
- **Card Header**: 表格外层卡片的头部区域，可配置标题、描述、操作按钮等
- **Toolbar**: 表格上方的工具栏区域，包含左侧操作按钮和右侧功能按钮
- **Column**: 表格列配置，定义数据展示方式
- **Action Column**: 操作列，包含行级操作按钮
- **Column Setting**: 列设置功能，允许用户调整列的显示/隐藏和顺序
- **Export**: 导出功能，支持导出全部数据或当前页数据
- **Slot**: Vue 插槽，允许用户自定义渲染内容
- **Request Function**: 数据请求函数，用于获取表格数据

## Requirements

### Requirement 1: Card Header Configuration

**User Story:** As a developer, I want to configure the card header section, so that I can customize the title, description, and header actions for different use cases.

#### Acceptance Criteria

1. WHEN a developer provides a `cardTitle` prop THEN the ProTable SHALL display the title in the card header area
2. WHEN a developer provides a `cardDescription` prop THEN the ProTable SHALL display the description below the title
3. WHEN a developer uses the `card-header` slot THEN the ProTable SHALL render the custom content in place of the default header
4. WHEN a developer uses the `card-header-extra` slot THEN the ProTable SHALL render the custom content on the right side of the header
5. WHEN a developer sets `showCard` to false THEN the ProTable SHALL render the table without the card wrapper
6. WHERE the `cardProps` option is provided THEN the ProTable SHALL pass these props to the underlying el-card component

### Requirement 2: Toolbar Configuration

**User Story:** As a developer, I want to fully configure the toolbar section, so that I can add custom buttons and control which default buttons are displayed.

#### Acceptance Criteria

1. WHEN a developer provides `toolbarConfig.showRefresh` as true THEN the ProTable SHALL display a refresh button that triggers data reload
2. WHEN a developer provides `toolbarConfig.showColumnSetting` as true THEN the ProTable SHALL display a column setting button that opens the column configuration dialog
3. WHEN a developer provides `toolbarConfig.showExportAll` as true THEN the ProTable SHALL display an export all button that exports all data
4. WHEN a developer provides `toolbarConfig.showExportPage` as true THEN the ProTable SHALL display an export current page button that exports only visible data
5. WHEN a developer uses the `toolbar-left` slot THEN the ProTable SHALL render the custom content on the left side of the toolbar
6. WHEN a developer uses the `toolbar-right` slot THEN the ProTable SHALL render the custom content on the right side of the toolbar (before default buttons)
7. WHEN a developer sets `showToolbar` to false THEN the ProTable SHALL hide the entire toolbar section
8. WHEN a developer provides `toolbarConfig.buttons` array THEN the ProTable SHALL render custom buttons in the specified order

### Requirement 3: Column Configuration

**User Story:** As a developer, I want to configure table columns with maximum flexibility, so that I can customize how each column displays and behaves.

#### Acceptance Criteria

1. WHEN a developer provides a column with `slotName` property THEN the ProTable SHALL use the named slot for rendering that column's content
2. WHEN a developer provides a column with `render` function THEN the ProTable SHALL use the function to render the column content
3. WHEN a developer provides a column with `formatter` function THEN the ProTable SHALL format the cell value using the function
4. WHEN a developer provides a column with `visible: false` THEN the ProTable SHALL hide that column from display
5. WHEN a developer provides a column with `hideable: false` THEN the ProTable SHALL prevent that column from being hidden in column settings
6. WHEN a developer provides a column with `sortable: true` THEN the ProTable SHALL enable sorting for that column
7. WHEN a developer provides a column with `filterable: true` THEN the ProTable SHALL enable filtering for that column
8. WHEN a developer provides a column with `fixed` property THEN the ProTable SHALL fix the column to the specified position

### Requirement 4: Action Column Configuration

**User Story:** As a developer, I want to configure the action column with custom buttons, so that I can define row-level operations flexibly.

#### Acceptance Criteria

1. WHEN a developer provides `actionColumn` config THEN the ProTable SHALL render an action column with the specified settings
2. WHEN a developer provides `actionColumn.buttons` array THEN the ProTable SHALL render the specified action buttons for each row
3. WHEN a developer uses the `action` slot THEN the ProTable SHALL render custom action content for each row
4. WHEN a developer provides `actionColumn.width` THEN the ProTable SHALL set the action column width accordingly
5. WHEN a developer provides a button with `show` function THEN the ProTable SHALL conditionally display the button based on the function result
6. WHEN a developer provides a button with `disabled` function THEN the ProTable SHALL conditionally disable the button based on the function result

### Requirement 5: Column Setting Dialog

**User Story:** As a developer, I want users to be able to adjust column visibility and order, so that they can customize their view of the data.

#### Acceptance Criteria

1. WHEN a user opens the column setting dialog THEN the ProTable SHALL display all hideable columns with checkboxes
2. WHEN a user toggles a column checkbox THEN the ProTable SHALL show or hide that column immediately
3. WHEN a user drags a column in the setting dialog THEN the ProTable SHALL reorder the columns accordingly
4. WHEN a user clicks the reset button THEN the ProTable SHALL restore columns to their default configuration
5. WHEN a user closes the dialog THEN the ProTable SHALL persist the column settings to localStorage if `persistColumnSettings` is true

### Requirement 6: Export Functionality

**User Story:** As a developer, I want to provide export functionality, so that users can download table data in various formats.

#### Acceptance Criteria

1. WHEN a user clicks the export all button THEN the ProTable SHALL trigger the `onExportAll` callback with all data
2. WHEN a user clicks the export page button THEN the ProTable SHALL trigger the `onExportPage` callback with current page data
3. WHEN a developer provides `exportConfig.filename` THEN the ProTable SHALL use the specified filename for exports
4. WHEN a developer provides `exportConfig.formats` array THEN the ProTable SHALL show a dropdown with available export formats
5. IF no export callback is provided THEN the ProTable SHALL use the default CSV export implementation

### Requirement 7: Selection and Batch Operations

**User Story:** As a developer, I want to enable row selection and batch operations, so that users can perform actions on multiple rows at once.

#### Acceptance Criteria

1. WHEN a developer sets `selectable` to true THEN the ProTable SHALL display a selection checkbox column
2. WHEN a user selects rows THEN the ProTable SHALL emit the `selection-change` event with selected rows
3. WHEN a developer provides `selectionConfig.selectable` function THEN the ProTable SHALL use it to determine if a row is selectable
4. WHEN a developer calls `getSelection()` method THEN the ProTable SHALL return the currently selected rows
5. WHEN a developer calls `clearSelection()` method THEN the ProTable SHALL clear all selected rows

### Requirement 8: Data Loading and Pagination

**User Story:** As a developer, I want flexible data loading options, so that I can use either static data or async requests with pagination.

#### Acceptance Criteria

1. WHEN a developer provides `dataSource` prop THEN the ProTable SHALL use the static data for display
2. WHEN a developer provides `request` function THEN the ProTable SHALL call it to fetch data with pagination params
3. WHEN a developer sets `pagination` to false THEN the ProTable SHALL hide the pagination component
4. WHEN a developer provides `paginationConfig` object THEN the ProTable SHALL use the specified pagination settings
5. WHEN a user changes page or page size THEN the ProTable SHALL reload data with new pagination params
6. WHEN data is loading THEN the ProTable SHALL display a loading indicator

### Requirement 9: Instance Methods

**User Story:** As a developer, I want to access table instance methods, so that I can programmatically control the table behavior.

#### Acceptance Criteria

1. WHEN a developer calls `refresh()` method THEN the ProTable SHALL reload the current page data
2. WHEN a developer calls `reset()` method THEN the ProTable SHALL reset to page 1 and reload data
3. WHEN a developer calls `getData()` method THEN the ProTable SHALL return the current table data
4. WHEN a developer calls `setLoading(boolean)` method THEN the ProTable SHALL update the loading state
5. WHEN a developer calls `getTableRef()` method THEN the ProTable SHALL return the underlying el-table ref

### Requirement 10: Empty State and Error Handling

**User Story:** As a developer, I want to customize empty and error states, so that I can provide better user experience.

#### Acceptance Criteria

1. WHEN the table has no data THEN the ProTable SHALL display the empty state with configurable text and icon
2. WHEN a developer uses the `empty` slot THEN the ProTable SHALL render custom empty state content
3. IF data loading fails THEN the ProTable SHALL display an error state with retry option
4. WHEN a developer uses the `error` slot THEN the ProTable SHALL render custom error state content
