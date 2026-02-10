import type { Scenario } from './types'

// ---------------------------------------------------------------------------
// Real OpenSpec content from agentic-development-alignment-taskforce
// ---------------------------------------------------------------------------

const SEED_CONTENT = `# E-Map Floor Plan Management (Seed)

## Pain Point
VSAAS customers need to visualize their camera deployments
in the physical context of their facilities. Current systems
lack spatial awareness, making it difficult for users to
understand camera coverage, manage device placement, and
monitor live feeds within the context of their floor plans.

## Desired Outcome
A visual floor plan interface where users can:
- Upload and manage floor plan images
- Place cameras on floor plans with drag-and-drop
- Configure camera field-of-view overlays
- Access live camera streams from the floor plan
- Search and filter cameras and sites

## Stakeholder Notes
- Must support both VORTEX cameras and cameras under NVR
- Buildings may have multiple floors (up to 10 per site)
- Some sites have 200+ cameras
- Mobile teams need view-only access on iOS/Android
- "Drag and drop would be nice" -- customer feedback

## Open Questions
- Image formats: which formats to support?
- Floor plan limit per site?
- Real-time preview: is this MVP or later?
- Camera view angle visualization: needed?
- Mobile editing: supported?`

const REFINED_REQUIREMENT_CONTENT = `# E-Map Floor Plan Management -- Refined Requirements

## Project

Enable VSAAS customers to visualize camera deployments
within the physical context of their facilities. Replace
spreadsheet-based camera tracking with an interactive
floor plan interface integrated into the Vortex portal.

## Scope (MVP)

- Floor plan image upload and management (JPEG, SVG)
- Interactive camera placement via drag-and-drop
- Camera field-of-view (FOV) visualization (sector model)
- Live camera stream preview (single stream at a time)
- Site and floor plan hierarchy with search
- Distinct Edit and View modes

## Decisions

| # | Topic                | Decision                          |
|---|----------------------|-----------------------------------|
| 1 | Image formats        | JPEG + SVG only (no PNG)          |
| 2 | Floor plan limit     | Max 10 per site                   |
| 3 | Live stream          | Single stream at a time           |
| 4 | Mobile support       | View-only (no touch editing)      |
| 5 | Edit vs View         | Separate modes, prevent accidents |
| 6 | Multi-floor cameras  | Same camera on multiple plans     |
|   |                      | with independent FOV configs      |

## Constraints

- Must integrate with existing camera management APIs
- Must support both VORTEX cameras and cameras under NVR
- Some sites have 200+ cameras -- UI must handle scale
- Image storage must comply with existing infrastructure
- Live streaming limited by per-site bandwidth budget

## Non-Goals

- Automatic camera placement or coverage optimization
- 3D visualization or multi-floor rendering
- Real-time collaborative editing
- Floor plan drawing tools (upload pre-made only)
- Camera analytics integration
- Automatic FOV calculation from camera specs
- Mobile edit mode

## Acceptance Criteria

- Users can upload JPEG/SVG floor plans and place cameras
- FOV overlays render correctly with angle/direction/depth
- Live stream launches from camera icon in view mode
- 10-plan-per-site limit enforced with clear messaging
- Edit mode prevents accidental modifications in view mode
- Mobile users can view floor plans and camera positions

## Approvals

- PM (David Wang): Approved scope and decisions
- RD (James Liu): Approved technical constraints
- UX (Emma Park): Approved interaction model`

const PROPOSAL_CONTENT = `# Floor Plan Management Proposal

## Why

VSAAS customers need to visualize their camera deployments in the physical context of their facilities. Current systems lack spatial awareness, making it difficult for users to understand camera coverage, manage device placement, and monitor live feeds within the context of their floor plans.

## What Changes

This proposal adds comprehensive floor plan management capabilities to the VSAAS platform, enabling users to:

- Organize sites and floor plans hierarchically within organizations
- Upload and manage floor plan images (JPEG, SVG) with size constraints
- Place cameras on floor plans with visual representation
- Configure camera field-of-view (FOV) overlays
- Access live camera streams directly from floor plan interface
- Search and filter cameras and sites

**Key Features**:
- Site and floor plan organization and search
- Floor plan image upload with validation (10 plans per site, max 10MB)
- Drag-and-drop device positioning with snapshot preview
- Interactive FOV editor for camera coverage visualization
- Live view integration (single stream at a time)
- Camera status indicators (Online/Offline/FW updating)
- View mode with zoom/pan controls

**Breaking Changes**: None - this is a new feature addition

## Impact

**Affected specs**:
- **NEW**: \`specs/floor-plan-management/spec.md\` - Floor plan CRUD operations
- **NEW**: \`specs/camera-visualization/spec.md\` - Device position and FOV editing
- **NEW**: \`specs/site-organization/spec.md\` - Site and floor plan hierarchy

**Affected code** (implementation delegated to backend/frontend/mobile endpoints):
- Backend: New API endpoints for floor plan CRUD, device position, image upload
- Frontend: New floor plan editor UI with canvas/SVG rendering
- Mobile: Floor plan viewing capabilities (view mode only)
- Database: New tables for floor plans, device positions, FOV configurations
- Storage: Image upload service integration for floor plan images

**Dependencies**:
- Image upload/storage service for floor plan images
- Camera API for retrieving camera lists and status
- Live streaming service for camera feed integration
- Organization/site management service

**Migration**: No migration required - new feature with no impact on existing functionality`

const DESIGN_CONTENT = `# Floor Plan Management Design

## Context

The VSAAS platform currently lacks spatial visualization capabilities for camera deployments. Users need to understand camera coverage within the physical layout of their facilities to optimize placement, monitor coverage gaps, and quickly access relevant camera feeds.

This design addresses floor plan management as a new feature set that integrates with existing site management, camera services, and live streaming infrastructure.

**Stakeholders**:
- End users (security operators, facility managers)
- Backend team (API development)
- Frontend team (UI/UX implementation)
- Mobile team (view-only mobile interface)
- Product team (feature prioritization)

**Constraints**:
- Must integrate with existing camera management APIs
- Must support both VORTEX cameras and cameras under NVR
- Image storage must comply with existing storage infrastructure
- Live streaming limited to single concurrent stream (resource constraint)
- Brown-field integration with existing site and organization models

## Goals / Non-Goals

**Goals**:
- Provide intuitive visual interface for device placement
- Support multiple floor plans per site (up to 10)
- Enable FOV visualization for coverage analysis
- Integrate live streaming into spatial context
- Support both JPEG and SVG floor plan formats
- Maintain good performance with complex floor plans
- Allow same camera on multiple floor plans (different perspectives)

**Non-Goals**:
- Automatic device placement or optimization (future enhancement)
- 3D visualization or multi-floor rendering
- Real-time collaboration (multiple users editing simultaneously)
- Floor plan drawing tools (users must upload pre-made floor plans)
- Camera analytics integration (future enhancement)
- Automatic FOV calculation from camera specs (manual configuration only)
- Mobile edit mode (mobile is view-only)

## Decisions

### 1. Capability Segmentation

**Decision**: Split functionality into three distinct capabilities: site-organization, floor-plan-management, and camera-visualization.

**Rationale**:
- Site organization is logically separate from floor plan editing
- Camera visualization has different concerns than floor plan CRUD
- Enables parallel development across teams
- Clear bounded contexts for each capability

**Alternatives considered**:
- Single monolithic spec: Rejected due to complexity and poor modularity
- More granular split (5+ capabilities): Rejected as over-engineering for initial release

### 2. Image Format Support

**Decision**: Support JPEG (.jfif, .pjpeg, .jpeg, .jpg) and SVG (.svg, .svgz) formats only.

**Rationale**:
- JPEG is universal and handles photographs/scanned floor plans
- SVG provides scalable vector graphics for architectural drawings
- Limits complexity of image processing pipeline
- Covers 95 percent of expected use cases

**Alternatives considered**:
- PNG support: Rejected due to typically larger file sizes for similar quality
- PDF support: Rejected due to complexity (multi-page handling, conversion overhead)
- TIFF support: Rejected as less common in web contexts

### 3. Floor Plan Limit (10 per Site)

**Decision**: Enforce maximum of 10 floor plans per site.

**Rationale**:
- Prevents UI/UX degradation with excessive floor plans
- Aligns with typical facility structures (most sites have fewer than 10 floors/areas)
- Limits storage and processing overhead per site
- Can be increased in future if justified by usage data

### 4. Single Live Stream Limitation

**Decision**: Allow only one live camera stream at a time in the floor plan interface.

**Rationale**:
- Reduces bandwidth and server load
- Simplifies UI interaction model
- Aligns with typical security operator workflow (focus on one camera at a time)
- Consistent with existing platform streaming constraints

### 5. Device Position Model (Multi-Floor Plan Support)

**Decision**: Allow same camera to be positioned on multiple floor plans with independent FOV configurations.

**Rationale**:
- Cameras at boundaries may appear on multiple floor plans (e.g., hallway camera visible from two floors)
- Each floor plan represents a different perspective, requiring different FOV overlays
- Provides flexibility for complex facility layouts

**Data model**:
\`\`\`
DevicePosition {
  device_ugly_id: string
  floor_plan_id: string
  position_x: number (0-1, normalized)
  position_y: number (0-1, normalized)
  fov_angle: number (0-360)
  fov_direction: number (0-360)
  fov_depth: number
}
\`\`\`

### 6. FOV Representation (Sector Model)

**Decision**: Use sector/wedge visualization for camera FOV with three parameters: angle, direction, depth.

**Rationale**:
- Intuitive visual representation matching real-world camera coverage
- Simple geometric model for rendering
- Three parameters provide sufficient control without overwhelming users

**Parameters**:
- Angle: FOV width (0-360 degrees)
- Direction: FOV orientation (0-360 degrees, 0 = North/Up)
- Depth: Visual range/radius on floor plan

### 7. Edit vs View Mode Separation

**Decision**: Implement distinct edit and view modes with different capabilities and UI controls.

**Rationale**:
- Prevents accidental edits during operational monitoring
- Simplifies UI by hiding edit-specific controls in view mode
- Aligns with common design patterns (Google Maps, etc.)

## Architecture

### Component Overview

\`\`\`
+-----------------------------------------------------------+
|                     Frontend UI Layer                      |
|  +--------------+  +--------------+  +--------------+     |
|  | Site List    |  | Floor Plan   |  | Camera List  |     |
|  | Component    |  | Editor       |  | Component    |     |
|  +--------------+  +--------------+  +--------------+     |
|         |                  |                  |            |
+---------|------------------|------------------|------------+
          |                  |                  |
          v                  v                  v
+-----------------------------------------------------------+
|                    Backend API Layer                       |
|  +--------------+  +--------------+  +--------------+     |
|  | Site API     |  | Floor Plan   |  | Camera       |     |
|  |              |  | API          |  | Placement API|     |
|  +--------------+  +--------------+  +--------------+     |
|         |                  |                  |            |
+---------|------------------|------------------|------------+
          |                  |                  |
          v                  v                  v
+-----------------------------------------------------------+
|                    Data Layer                              |
|  +--------------+  +--------------+  +--------------+     |
|  | Site DB      |  | Floor Plan   |  | Camera       |     |
|  |              |  | Storage      |  | Placement DB |     |
|  +--------------+  +--------------+  +--------------+     |
+-----------------------------------------------------------+
\`\`\`

### Data Model

**Floor Plan Entity**:
\`\`\`
FloorPlan {
  id: UUID
  site_id: UUID (FK to Site)
  name: string
  image_url: string (storage reference, nullable)
}
\`\`\`

**Device Position Entity**:
\`\`\`
DevicePosition {
  id: UUID
  floor_plan_id: UUID (FK to FloorPlan)
  device_ugly_id: string (FK to Device service)
  position_x: number (0-1, normalized coordinate)
  position_y: number (0-1, normalized coordinate)
  fov_angle: number (0-360 degrees)
  fov_direction: number (0-360 degrees)
  fov_depth: number (normalized to floor plan scale)
}

UNIQUE (floor_plan_id, device_ugly_id)
\`\`\`

### API Design Principles

Follow existing VSAAS API conventions:
- RESTful endpoints
- JWT authentication
- JSON request/response bodies
- Standard HTTP status codes
- Pagination for list endpoints
- RFC 9457 Problem Details for error responses

**Key Endpoints**:
- \`GET /sites/{siteId}/floor-plans\` - List floor plans
- \`POST /sites/{siteId}/floor-plans\` - Create floor plan
- \`PATCH /floor-plans/{id}\` - Update floor plan
- \`DELETE /floor-plans/{id}\` - Delete floor plan
- \`POST /floor-plans/{id}/upload\` - Upload floor plan image
- \`GET /floor-plans/{id}/device-positions\` - List device positions
- \`POST /floor-plans/{id}/device-positions\` - Position device
- \`PATCH /floor-plans/{id}/device-positions/{posId}\` - Update position/FOV
- \`DELETE /floor-plans/{id}/device-positions/{posId}\` - Remove device

## Risks / Trade-offs

### Risk: Large Image Performance
Very large floor plan images may cause rendering performance issues on lower-end devices.
**Mitigation**: Client-side image downsampling, progressive loading, recommend 2-10 MB range.

### Risk: Live Stream Resource Exhaustion
Single stream limitation may frustrate power users who want multi-camera monitoring.
**Mitigation**: Clear UI indication, quick toggle between cameras, future multi-stream option.

### Risk: FOV Accuracy
Manual FOV configuration may not accurately represent real camera coverage.
**Mitigation**: Treat FOV as approximate/illustrative, provide best practices documentation.

### Trade-off: Mobile Edit Mode
Mobile devices get view-only mode, no editing capabilities.
**Justification**: Touch-based placement is imprecise, smaller screens make FOV editing difficult.

## Migration Plan

**No migration required** - new feature with no impact on existing data.
Feature flag controlled rollout: pilot sites -> new customers -> general availability.`

const SPEC_FLOOR_PLAN_CONTENT = `---
source: authored
extracted_at: 2025-11-24
confidence: high
---

# floor-plan-management Specification

## Requirements

### Requirement: Floor Plan CRUD Operations (portal only)

The system SHALL provide create, read, update, and delete operations for floor plans within a site.

#### Scenario: Create new floor plan

- **WHEN** user creates a new floor plan in a site with fewer than 10 floor plans
- **THEN** system creates the floor plan
- **AND** allows user to upload an image and set a name
- **AND** initializes an empty device position list

#### Scenario: Read floor plan details

- **WHEN** user selects a floor plan from the site list
- **THEN** system loads and displays the floor plan image
- **AND** displays all cameras positioned on that floor plan
- **AND** shows floor plan metadata (name)

#### Scenario: Update floor plan name

- **WHEN** user is in edit mode and modifies the floor plan name
- **THEN** system validates the name follows the naming pattern
- **AND** validates the name is not empty (1-255 characters)
- **AND** validates no special characters: > < ( ) " % ; # & + - \\
- **WHEN** validation passes
- **THEN** system updates the floor plan name
- **AND** reflects the change in the site list

#### Scenario: Delete floor plan

- **WHEN** user deletes a floor plan
- **THEN** system prompts for confirmation
- **AND** removes the floor plan and all associated device positions
- **AND** updates the site's floor plan count

### Requirement: Floor Plan Image Upload (portal only)

The system SHALL support uploading floor plan images with format and size validation.

#### Scenario: Valid JPEG upload

- **WHEN** user uploads a JPEG image (.jfif, .pjpeg, .jpeg, .jpg)
- **AND** file size is less than 10 MB
- **THEN** system accepts the upload and displays the image

#### Scenario: Valid SVG upload

- **WHEN** user uploads an SVG image (.svg, .svgz)
- **AND** file size is less than 10 MB
- **THEN** system accepts the upload and displays the SVG

#### Scenario: Invalid file format

- **WHEN** user attempts to upload a file that is not JPEG or SVG
- **THEN** system rejects the upload
- **AND** displays "Invalid format. Only JPEG and SVG formats are supported."

#### Scenario: Replace floor plan image preserves camera positions

- **WHEN** user uploads a new floor plan image to replace an existing one
- **THEN** system replaces the background image
- **AND** preserves all existing camera positions and coordinates
- **AND** maintains all FOV configurations

### Requirement: Floor Plan View Controls

The system SHALL provide interactive controls for navigating floor plans.

#### Scenario: Zoom in/out

- **WHEN** user clicks zoom button or uses gesture
- **THEN** system adjusts magnification by 25 percent
- **AND** maintains center point of current view

#### Scenario: Pan floor plan

- **WHEN** user drags the floor plan while zoomed in
- **THEN** system pans the view in the drag direction
- **AND** prevents panning beyond floor plan boundaries

### Requirement: Edit and View Modes (portal only)

The system SHALL provide distinct edit and view modes.

#### Scenario: Switch to edit mode

- **WHEN** user clicks "Edit" button
- **THEN** system enables editing tools (add/edit/delete cameras)
- **AND** displays edit-specific controls (FOV editor, drag-and-drop)

#### Scenario: Switch to view mode

- **WHEN** user clicks "View" button
- **THEN** system disables editing capabilities
- **AND** enables view features (live stream, camera status, search)`

const SPEC_CAMERA_VIS_CONTENT = `---
source: authored
extracted_at: 2025-11-24
confidence: high
---

# camera-visualization Specification

## Requirements

### Requirement: Device Position on Floor Plan (portal only)

The system SHALL allow users to position cameras onto floor plans using drag-and-drop.

#### Scenario: Display available cameras

- **WHEN** user is in edit mode
- **THEN** system displays a list of all cameras in the site
- **AND** shows camera name and current snapshot
- **AND** overlays placement status indicator

#### Scenario: Drag camera onto floor plan

- **WHEN** user drags a camera from the list onto the floor plan
- **THEN** system positions the camera icon at the drop location
- **AND** displays the camera name
- **AND** marks the camera as positioned

#### Scenario: Reposition existing camera

- **WHEN** user drags an already-positioned camera to a new location
- **THEN** system displays a confirmation popup
- **AND** allows user to confirm or cancel
- **WHEN** user confirms
- **THEN** system updates the camera position
- **AND** maintains the camera's FOV configuration

### Requirement: Camera Across Multiple Floor Plans (portal only)

The system SHALL allow the same camera on different floor plans within a site.

#### Scenario: Position camera on multiple floor plans

- **WHEN** a camera is already positioned on floor plan A
- **AND** user positions the same camera on floor plan B
- **THEN** system allows the position
- **AND** maintains independent position and FOV settings for each

### Requirement: Camera FOV Configuration (portal only)

The system SHALL provide a FOV adjustment for configuring camera field-of-view overlays.

#### Scenario: Adjust FOV angle

- **WHEN** user adjusts the FOV angle using the sector tool
- **THEN** system updates the FOV overlay in real-time
- **AND** constrains the angle between 10 and 360 degrees

#### Scenario: Adjust FOV direction

- **WHEN** user rotates the FOV sector
- **THEN** system updates the direction of the FOV overlay

#### Scenario: Adjust FOV depth

- **WHEN** user adjusts the FOV depth/range
- **THEN** system updates the length of the FOV sector
- **AND** scales the overlay proportionally to the floor plan

#### Scenario: Save FOV configuration

- **WHEN** user saves the FOV configuration
- **THEN** system stores angle, direction, depth for the camera
- **AND** displays the FOV overlay whenever the floor plan is viewed

### Requirement: Delete Device Position from Floor Plan (portal only)

#### Scenario: Delete device position

- **WHEN** user selects a positioned camera and clicks "Delete"
- **THEN** system removes the camera from the floor plan
- **AND** removes the associated FOV overlay
- **AND** returns the camera to the available camera list

### Requirement: Camera Status Display in View Mode

#### Scenario: Online camera status

- **WHEN** camera is online and streaming
- **THEN** system displays a green status indicator

#### Scenario: Offline camera status

- **WHEN** camera is offline
- **THEN** system displays a gray status indicator

#### Scenario: Firmware updating status

- **WHEN** camera is performing a firmware update
- **THEN** system displays an amber status indicator

### Requirement: Camera Live View

#### Scenario: Open live view

- **WHEN** user clicks a camera icon in view mode
- **THEN** system displays the camera's live stream in a popover

#### Scenario: Single live stream limitation

- **WHEN** user clicks another camera while one is streaming
- **THEN** system stops the previous stream
- **AND** starts the newly selected camera's stream

#### Scenario: Offline camera live view

- **WHEN** user clicks on an offline camera
- **THEN** system displays "Camera disconnected" message

### Requirement: Camera Search in View Mode

#### Scenario: Search camera by name

- **WHEN** user enters text in the search field
- **THEN** system highlights matching cameras on the floor plan
- **AND** dims non-matching cameras`

const SPEC_SITE_ORG_CONTENT = `---
source: authored
extracted_at: 2025-11-24
confidence: high
---

# site-organization Specification

## Requirements

### Requirement: Site List Display

The system SHALL display a hierarchical list of all sites under the current organization and all floor plans under each site.

#### Scenario: User views site list

- **WHEN** user navigates to the floor plan management interface
- **THEN** system displays a list of all sites under the organization
- **AND** each site displays all associated floor plans in hierarchical structure

### Requirement: Site and Floor Plan Search

The system SHALL provide search functionality to filter sites and floor plans by name.

#### Scenario: Search by site name

- **WHEN** user enters text in the search field
- **THEN** system filters to show only sites matching the search term
- **AND** displays all floor plans under matching sites

#### Scenario: Search by floor plan name

- **WHEN** user enters text in the search field
- **THEN** system filters to show sites containing matching floor plans
- **AND** displays only the matching floor plans under their parent sites

### Requirement: Floor Plan Limit per Site

The system SHALL enforce a maximum limit of 10 floor plans per site.

#### Scenario: Floor plan limit not reached

- **WHEN** a site has fewer than 10 floor plans
- **THEN** system allows user to upload additional floor plans

#### Scenario: Floor plan limit reached

- **WHEN** a site already has 10 floor plans
- **THEN** system disables the upload button
- **AND** displays "Maximum limit of floor plans for a single site reached."
- **AND** user MUST delete an existing floor plan before adding a new one`

const OPENAPI_CONTENT = `openapi: 3.0.3
info:
  title: Floor Plan Management API
  description: |
    API for managing floor plans and device placements within VSAAS platform.
    Enables users to upload floor plan images, place devices (cameras) on
    floor plans, configure FOV overlays, and visualize spatial device coverage.

    **Compliance:**
    - Follows VIVOTEK API Design Principles (ADP)
    - RFC 9457 Problem Details for error responses
    - RFC 8288 Web Linking for pagination
  version: 1.0.1

servers:
  - url: https://api.backend.dev.vortexcloud.com/v1

tags:
  - name: Floor Plans
    description: Floor plan CRUD operations
  - name: Device Positions
    description: Device position and FOV configuration on floor plans
  - name: Image Upload
    description: Floor plan image upload operations

security:
  - BearerAuth: []

paths:
  /sites/{siteId}/floor-plans:
    get:
      tags: [Floor Plans]
      summary: List floor plans for a site
      operationId: listFloorPlans
      parameters:
        - $ref: '#/components/parameters/SiteIdPath'
      responses:
        '200':
          description: Successfully retrieved floor plans
          content:
            application/json:
              schema:
                type: object
                required: [floorPlans]
                properties:
                  floorPlans:
                    type: array
                    items:
                      $ref: '#/components/schemas/FloorPlan'

    post:
      tags: [Floor Plans]
      summary: Create a new floor plan
      description: |
        Create a new floor plan for a site. Maximum of 10 floor plans per site.
        Initial floor plan is created without an image (uploaded separately).
      operationId: createFloorPlan
      parameters:
        - $ref: '#/components/parameters/SiteIdPath'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateFloorPlanRequest'
      responses:
        '201':
          description: Floor plan created successfully
          headers:
            Location:
              description: URL of the created floor plan resource
              schema:
                type: string
                format: uri
        '422':
          description: Business rule violation (e.g., 10 floor plan limit)

  /floor-plans/{floorPlanId}:
    get:
      tags: [Floor Plans]
      summary: Get floor plan details
      operationId: getFloorPlan
      parameters:
        - $ref: '#/components/parameters/FloorPlanIdPath'
      responses:
        '200':
          description: Successfully retrieved floor plan

    patch:
      tags: [Floor Plans]
      summary: Update floor plan
      description: Partially update floor plan metadata (name only).
      operationId: updateFloorPlan
      parameters:
        - $ref: '#/components/parameters/FloorPlanIdPath'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateFloorPlanRequest'
      responses:
        '200':
          description: Floor plan updated successfully

    delete:
      tags: [Floor Plans]
      summary: Delete floor plan
      description: Delete floor plan and all associated device placements.
      operationId: deleteFloorPlan
      parameters:
        - $ref: '#/components/parameters/FloorPlanIdPath'
      responses:
        '204':
          description: Floor plan deleted successfully

  /floor-plans/{floorPlanId}/upload:
    post:
      tags: [Image Upload]
      summary: Upload floor plan image
      description: |
        Upload or replace floor plan image. Supports JPEG and SVG formats.
        Validation: JPEG (.jfif, .pjpeg, .jpeg, .jpg) or SVG (.svg, .svgz).
        Maximum file size: 10 MB.
      operationId: uploadFloorPlanImage
      parameters:
        - $ref: '#/components/parameters/FloorPlanIdPath'
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required: [file]
              properties:
                file:
                  type: string
                  format: binary
      responses:
        '200':
          description: Image uploaded successfully

  /floor-plans/{floorPlanId}/device-positions:
    get:
      tags: [Device Positions]
      summary: List device positions on floor plan
      operationId: listDevicePositions
      parameters:
        - $ref: '#/components/parameters/FloorPlanIdPath'
      responses:
        '200':
          description: Successfully retrieved device positions
          content:
            application/json:
              schema:
                type: object
                required: [devicePositions]
                properties:
                  devicePositions:
                    type: array
                    items:
                      $ref: '#/components/schemas/DevicePosition'

    post:
      tags: [Device Positions]
      summary: Position device on floor plan
      description: |
        Add a device to a floor plan with initial position and FOV config.
        Device must exist in the site's device list.
      operationId: createDevicePosition
      parameters:
        - $ref: '#/components/parameters/FloorPlanIdPath'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateDevicePositionRequest'
      responses:
        '201':
          description: Device positioned successfully
        '409':
          description: Conflict - device already positioned on this floor plan

  /floor-plans/{floorPlanId}/device-positions/{devicePositionId}:
    patch:
      tags: [Device Positions]
      summary: Update device position
      description: Partially update device position and/or FOV configuration.
      operationId: updateDevicePosition
      parameters:
        - $ref: '#/components/parameters/FloorPlanIdPath'
        - $ref: '#/components/parameters/DevicePositionIdPath'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateDevicePositionRequest'
      responses:
        '200':
          description: Device position updated successfully

    delete:
      tags: [Device Positions]
      summary: Remove device from floor plan
      description: Remove device position (device remains in site).
      operationId: deleteDevicePosition
      parameters:
        - $ref: '#/components/parameters/FloorPlanIdPath'
        - $ref: '#/components/parameters/DevicePositionIdPath'
      responses:
        '204':
          description: Device position deleted successfully

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  parameters:
    SiteIdPath:
      name: siteId
      in: path
      required: true
      schema:
        type: string
        format: uuid

    FloorPlanIdPath:
      name: floorPlanId
      in: path
      required: true
      schema:
        type: string
        format: uuid

    DevicePositionIdPath:
      name: devicePositionId
      in: path
      required: true
      schema:
        type: string
        format: uuid

  schemas:
    FloorPlan:
      type: object
      required: [id, siteId, name]
      properties:
        id:
          type: string
          format: uuid
        siteId:
          type: string
          format: uuid
        name:
          type: string
          minLength: 1
          maxLength: 255
          pattern: '^([^><()"%;\\'#&+\\\\-]+)$'
        imageUrl:
          type: string
          format: uri
          nullable: true

    DevicePosition:
      type: object
      required:
        - id
        - floorPlanId
        - deviceSerialNumber
        - positionX
        - positionY
        - fovAngle
        - fovDirection
        - fovDepth
      properties:
        id:
          type: string
          format: uuid
        floorPlanId:
          type: string
          format: uuid
        deviceSerialNumber:
          type: string
          description: Format thingName:derivant
        positionX:
          type: number
          minimum: 0
          maximum: 1
          description: Normalized X (0=left, 1=right)
        positionY:
          type: number
          minimum: 0
          maximum: 1
          description: Normalized Y (0=top, 1=bottom)
        fovAngle:
          type: number
          minimum: 0
          maximum: 360
        fovDirection:
          type: number
          minimum: 0
          maximum: 360
          description: 0 = North/Up, clockwise
        fovDepth:
          type: number
          minimum: 0
          maximum: 1
          description: Normalized to floor plan diagonal

    CreateFloorPlanRequest:
      type: object
      required: [name]
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 255

    UpdateFloorPlanRequest:
      type: object
      required: [name]
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 255

    CreateDevicePositionRequest:
      type: object
      required: [deviceSerialNumber, positionX, positionY]
      properties:
        deviceSerialNumber:
          type: string
        positionX:
          type: number
          minimum: 0
          maximum: 1
        positionY:
          type: number
          minimum: 0
          maximum: 1
        fovAngle:
          type: number
          default: 90
        fovDirection:
          type: number
          default: 0
        fovDepth:
          type: number
          default: 0.15

    UpdateDevicePositionRequest:
      type: object
      properties:
        positionX:
          type: number
        positionY:
          type: number
        fovAngle:
          type: number
        fovDirection:
          type: number
        fovDepth:
          type: number

    ProblemDetails:
      type: object
      required: [type, title, status]
      description: RFC 9457 Problem Details for HTTP APIs`

const UI_FLOW_CONTENT = `# Floor Plan Management - UI Flow Specification

Based on OpenSpec specs: floor-plan-management, camera-visualization, site-organization

## Key Pages Overview

### 1. Maps_FloorPlan_Navigation
- Fixed left sidebar with site/floor plan hierarchy
- Search functionality for Site/Floorplan/Device
- Create Floorplan entry point

### 2. Maps_FloorPlan_Create_Modal
- Modal dialog for creating new floor plans
- Fields: Floorplan Name, Site, Floorplan File (optional at creation)
- Success notification after creation

### 3. Maps_FloorPlan_View
- Read-only view of floor plan with positioned devices
- Device status indicators (Online/Offline/Updating)
- Live stream viewing on device click
- Search and zoom/pan controls

### 4. Maps_FloorPlan_Edit
- Editable floor plan with device placement
- Device Panel showing Available and Placed tabs
- FOV adjustment for cameras
- Drag-and-drop device positioning

### 5. Maps_FloorPlan_BasicSettings
- Right sidebar panel for editing floor plan metadata
- Fields: Floorplan Name, Site, Floorplan File
- Replace floor plan image while preserving device positions

---

## Page Details

### Maps_FloorPlan_Navigation (Left Sidebar)

Purpose: Persistent navigation for sites and floor plans

Layout:
+-----------------------------+
| Floorplans                  |
|-----------------------------|
| [Search Site/Floorplan/     |
|  Device]                    |
|-----------------------------|
| > Site name 1               |
|   +-- Floorplan name 1      |
|   +-- Floorplan name 2      |
|-----------------------------|
| v Site name 2               |
|   +-- Floorplan name 3      |
|   +-- Floorplan name 4      |
|-----------------------------|
| [+ Create Floorplan]        |
+-----------------------------+

Components:
- Header: "Floorplans" title
- Search Bar: "Search Site/Floorplan/Device"
- Site Tree View: Collapsible site nodes with chevron icons
- Create Button: "+ Create Floorplan"

Interactions:
- Click site name -> expand/collapse floor plans
- Click floor plan name -> load in main workspace
- Search -> filter sites/floor plans/devices in real-time
- Click Create -> open Create Modal

Validation:
- When site reaches 10 floor plans, display "(10 of 10)" and disable create

---

### Maps_FloorPlan_View (View Mode)

Purpose: Read-only view with device monitoring

Layout:
+---------------------------------------------------------+
| Site / Floorplan name    [View] [Edit] [Delete]         |
|                                        [Basic settings] |
|---------------------------------------------------------|
|                                                         |
|                 Floor Plan Canvas                        |
|           +---------------------------+                  |
|           |                           |                  |
|           |  Cam Device 1 (green)     |                  |
|           |                           |                  |
|           |         Cam Device 2 (green)|                |
|           |                           |                  |
|           |  NVR Device 3 (gray)      |                  |
|           |                           |                  |
|           +---------------------------+                  |
|                                                         |
|  [Zoom Controls]                                        |
+---------------------------------------------------------+

Legend:
  green = Online
  gray = Offline
  yellow = Firmware Updating

Device Icons: Camera, NVR, Bridge, Network speaker, PoE Switch (32x32px)
Status Colors: Online #10B981, Offline #6B7280, Updating #FBBF24

Interactions:
  Click device -> Open live view popover (if camera & online)
  Hover device -> Show tooltip with name and status
  Search -> Highlight matching devices, dim others
  View/Edit toggle -> Switch modes (if permitted)
  Delete -> Prompt confirmation
  Zoom in/out -> 25% increment
  Drag canvas -> Pan (when zoomed)
  Reset View -> Fit floor plan in viewport

Live View Popover (single stream at a time):
  +-----------------------------+
  | Device Name       [Online]  |
  |-----------------------------|
  |   [Live Video Stream]       |
  |-----------------------------|
  | [View Full Screen]   [x]    |
  +-----------------------------+

---

### Maps_FloorPlan_Edit (Edit Mode)

Purpose: Device placement and FOV configuration

Layout:
+----------------------------------------------------------------------+
| Site / Floorplan        [View] [Edit] [Delete] [Basic settings]      |
|-----------------------------+----------------------------------------|
|                             |  Search device                         |
|                             |----------------------------------------|
|   Floor Plan Canvas         |  [Available]  [Placed]                 |
|                             |----------------------------------------|
|  +---------------------+   |  Camera v                              |
|  |                     |   |    Cam Camera name 002                  |
|  |  Cam Camera 001     |   |    Cam Camera name 003                  |
|  |  [Camera 001 label] |   |                                        |
|  |  [x Delete]         |   |  NVR v                                 |
|  |                     |   |    NVR name 001                        |
|  |    FOV Sector       |   |                                        |
|  |                     |   |  Bridge v                              |
|  +---------------------+   |    Bridge name 001                     |
|                             |                                        |
|  [Zoom Controls]            |  Network speaker v                     |
|                             |    Speaker name 001                    |
+-----------------------------+----------------------------------------+

Device Panel Tabs:
- Available: Devices NOT positioned on ANY floor plan (draggable)
- Placed: Devices on OTHER floor plans (read-only, non-draggable)

Device Placement Flow:
  Drag device from Available tab
    -> Drop onto canvas
    -> System positions device at drop location
    -> Device moves from Available tab to canvas
    -> Auto-save position

FOV Adjustment (Cameras only):
  Select camera on canvas
    -> FOV sector overlay appears
    -> Adjust angle (0-360 deg), direction, depth
    -> Real-time visual feedback
    -> Auto-save on adjustment end

Delete Device Flow:
  Click device on canvas (Active state)
    -> Click [x Delete] button
    -> Confirmation prompt
    -> Remove from canvas, remove FOV overlay
    -> Device returns to Available tab

---

## Interaction Constraints

1. Floor Plans per Site: Maximum 10
2. Live Streams: Only 1 at a time
3. Device can be on multiple floor plans (independent coords/FOV)
4. Auto-Save: Device positions and FOV save automatically
5. Unsaved Changes: Only for metadata changes via Basic Settings

## Permission Matrix

| Role       | View | Edit | Delete | Create |
|------------|------|------|--------|--------|
| OWNER      | All  | All  | All    | Yes    |
| ADMIN      | All  | All  | All    | Yes    |
| SUPERVISOR | Group| Group| Group  | Group  |
| USER       | All  | No   | No     | No     |
| GUEST      | All  | No   | No     | No     |
| VIEWER     | Group| No   | No     | No     |`

const SERVICE_CODE = `import { Router, Request, Response } from 'express'
import { z } from 'zod'

const router = Router()

// Validation schemas aligned with OpenAPI spec
const FloorPlanNameSchema = z.string()
  .min(1).max(255)
  .regex(/^([^><()"%;#&+\\-\\\\]+)$/)

const DevicePositionSchema = z.object({
  deviceSerialNumber: z.string(),
  positionX: z.number().min(0).max(1),
  positionY: z.number().min(0).max(1),
  fovAngle: z.number().min(0).max(360).default(90),
  fovDirection: z.number().min(0).max(360).default(0),
  fovDepth: z.number().min(0).max(1).default(0.15),
})

// GET /sites/:siteId/floor-plans
router.get('/sites/:siteId/floor-plans',
  async (req: Request, res: Response) => {
    const { siteId } = req.params
    const plans = await floorPlanRepo.listBySite(siteId)
    res.json({ floorPlans: plans })
  }
)

// POST /sites/:siteId/floor-plans
router.post('/sites/:siteId/floor-plans',
  async (req: Request, res: Response) => {
    const { siteId } = req.params
    const { name } = req.body

    // Validate 10 floor plan limit per site
    const count = await floorPlanRepo.countBySite(siteId)
    if (count >= 10) {
      return res.status(422).json({
        type: '/problems/unprocessable-entity',
        title: 'Unprocessable Entity',
        status: 422,
        detail: 'Maximum of 10 floor plans per site.',
      })
    }

    const plan = await floorPlanRepo.create({
      siteId, name: FloorPlanNameSchema.parse(name),
    })
    res.status(201)
      .header('Location', \\\`/v1/floor-plans/\\\${plan.id}\\\`)
      .json(plan)
  }
)

// POST /floor-plans/:floorPlanId/upload
router.post('/floor-plans/:floorPlanId/upload',
  upload.single('file'),
  async (req: Request, res: Response) => {
    const { floorPlanId } = req.params
    // Validate: JPEG or SVG, max 10MB
    const file = req.file!
    const plan = await floorPlanRepo.uploadImage(
      floorPlanId, file
    )
    res.json(plan)
  }
)

// GET /floor-plans/:floorPlanId/device-positions
router.get('/floor-plans/:floorPlanId/device-positions',
  async (req: Request, res: Response) => {
    const positions = await devicePositionRepo
      .listByFloorPlan(req.params.floorPlanId)
    res.json({ devicePositions: positions })
  }
)

// POST /floor-plans/:floorPlanId/device-positions
router.post('/floor-plans/:floorPlanId/device-positions',
  async (req: Request, res: Response) => {
    const data = DevicePositionSchema.parse(req.body)
    const position = await devicePositionRepo.create({
      floorPlanId: req.params.floorPlanId, ...data,
    })
    res.status(201).json(position)
  }
)

// PATCH /floor-plans/:floorPlanId/device-positions/:id
router.patch(
  '/floor-plans/:floorPlanId/device-positions/:devicePositionId',
  async (req: Request, res: Response) => {
    const { floorPlanId, devicePositionId } = req.params
    const position = await devicePositionRepo.update(
      floorPlanId, devicePositionId, req.body
    )
    res.json(position)
  }
)

export default router`

const TEST_CODE = `import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../app'

describe('Floor Plan Management API', () => {
  const siteId = '123e4567-e89b-12d3-a456-426614174000'

  describe('GET /sites/:siteId/floor-plans', () => {
    it('returns empty list initially', async () => {
      const res = await request(app)
        .get(\\\`/v1/sites/\\\${siteId}/floor-plans\\\`)
      expect(res.status).toBe(200)
      expect(res.body.floorPlans).toEqual([])
    })

    it('returns created floor plans', async () => {
      await createTestFloorPlan(siteId, 'Ground Floor')
      const res = await request(app)
        .get(\\\`/v1/sites/\\\${siteId}/floor-plans\\\`)
      expect(res.body.floorPlans).toHaveLength(1)
      expect(res.body.floorPlans[0].name).toBe('Ground Floor')
    })
  })

  describe('POST /sites/:siteId/floor-plans', () => {
    it('creates floor plan with valid name', async () => {
      const res = await request(app)
        .post(\\\`/v1/sites/\\\${siteId}/floor-plans\\\`)
        .send({ name: 'Second Floor' })
      expect(res.status).toBe(201)
      expect(res.headers.location).toMatch(/\\/v1\\/floor-plans\\//)
    })

    it('rejects invalid name characters', async () => {
      const res = await request(app)
        .post(\\\`/v1/sites/\\\${siteId}/floor-plans\\\`)
        .send({ name: 'Floor <script>' })
      expect(res.status).toBe(400)
    })

    it('enforces 10 floor plan limit per site', async () => {
      for (let i = 0; i < 10; i++) {
        await createTestFloorPlan(siteId, \\\`Floor \\\${i}\\\`)
      }
      const res = await request(app)
        .post(\\\`/v1/sites/\\\${siteId}/floor-plans\\\`)
        .send({ name: 'Floor 11' })
      expect(res.status).toBe(422)
      expect(res.body.detail).toContain('Maximum of 10')
    })
  })

  describe('POST /floor-plans/:id/device-positions', () => {
    it('places device on floor plan', async () => {
      const plan = await createTestFloorPlan(siteId, 'Lobby')
      const res = await request(app)
        .post(\\\`/v1/floor-plans/\\\${plan.id}/device-positions\\\`)
        .send({
          deviceSerialNumber: 'cam001:0',
          positionX: 0.5,
          positionY: 0.3,
          fovAngle: 90,
          fovDirection: 45,
          fovDepth: 0.15,
        })
      expect(res.status).toBe(201)
      expect(res.body.positionX).toBe(0.5)
    })

    it('validates position bounds (0-1)', async () => {
      const plan = await createTestFloorPlan(siteId, 'Test')
      const res = await request(app)
        .post(\\\`/v1/floor-plans/\\\${plan.id}/device-positions\\\`)
        .send({
          deviceSerialNumber: 'cam002:0',
          positionX: 2.0,
          positionY: -1,
        })
      expect(res.status).toBe(400)
    })

    it('rejects duplicate device on same floor plan', async () => {
      const plan = await createTestFloorPlan(siteId, 'Dupe Test')
      await request(app)
        .post(\\\`/v1/floor-plans/\\\${plan.id}/device-positions\\\`)
        .send({ deviceSerialNumber: 'cam003:0', positionX: 0.1, positionY: 0.1 })
      const res = await request(app)
        .post(\\\`/v1/floor-plans/\\\${plan.id}/device-positions\\\`)
        .send({ deviceSerialNumber: 'cam003:0', positionX: 0.9, positionY: 0.9 })
      expect(res.status).toBe(409)
    })
  })

  describe('POST /floor-plans/:id/upload', () => {
    it('accepts JPEG upload under 10MB', async () => {
      const plan = await createTestFloorPlan(siteId, 'Upload Test')
      const res = await request(app)
        .post(\\\`/v1/floor-plans/\\\${plan.id}/upload\\\`)
        .attach('file', 'test/fixtures/floor-plan.jpg')
      expect(res.status).toBe(200)
      expect(res.body.imageUrl).toBeTruthy()
    })

    it('rejects PNG format', async () => {
      const plan = await createTestFloorPlan(siteId, 'Format Test')
      const res = await request(app)
        .post(\\\`/v1/floor-plans/\\\${plan.id}/upload\\\`)
        .attach('file', 'test/fixtures/floor-plan.png')
      expect(res.status).toBe(400)
    })
  })
})`

const COMPONENT_CODE = `<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const props = defineProps<{
  floorPlanId: string
  imageUrl: string
  mode: 'view' | 'edit'
}>()

const emit = defineEmits<{
  (e: 'device-click', deviceId: string): void
  (e: 'device-placed', payload: {
    deviceSerialNumber: string
    positionX: number
    positionY: number
  }): void
}>()

const canvas = ref<HTMLCanvasElement>()
const devices = ref<DevicePosition[]>([])
const selectedDevice = ref<string | null>(null)
const zoom = ref(1)
const panOffset = ref({ x: 0, y: 0 })

const isEditMode = computed(() => props.mode === 'edit')

interface DevicePosition {
  id: string
  deviceSerialNumber: string
  positionX: number
  positionY: number
  fovAngle: number
  fovDirection: number
  fovDepth: number
  status?: 'online' | 'offline' | 'updating'
}

async function loadDevicePositions() {
  const res = await fetch(
    \\\`/v1/floor-plans/\\\${props.floorPlanId}/device-positions\\\`
  )
  const data = await res.json()
  devices.value = data.devicePositions
}

function handleCanvasDrop(e: DragEvent) {
  if (!isEditMode.value || !canvas.value) return
  const rect = canvas.value.getBoundingClientRect()
  const positionX = (e.clientX - rect.left) / rect.width
  const positionY = (e.clientY - rect.top) / rect.height
  const deviceSerialNumber = e.dataTransfer?.getData('deviceId')
  if (deviceSerialNumber) {
    emit('device-placed', { deviceSerialNumber, positionX, positionY })
  }
}

function drawFOVSector(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  angle: number, direction: number, depth: number
) {
  const startAngle = (direction - angle / 2) * Math.PI / 180
  const endAngle = (direction + angle / 2) * Math.PI / 180
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.arc(x, y, depth, startAngle, endAngle)
  ctx.closePath()
  ctx.fillStyle = 'rgba(59, 130, 246, 0.15)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)'
  ctx.stroke()
}

onMounted(() => loadDevicePositions())
</script>

<template>
  <div class="relative w-full h-full overflow-hidden">
    <canvas
      ref="canvas"
      class="w-full h-full"
      @drop.prevent="handleCanvasDrop"
      @dragover.prevent
    />
    <div class="absolute top-2 right-2 bg-black/50 rounded px-2 py-1 text-xs text-white">
      {{ devices.length }} devices placed
    </div>
    <div class="absolute bottom-2 right-2 flex gap-1">
      <button @click="zoom = Math.min(4, zoom + 0.25)" class="bg-black/50 text-white px-2 py-1 rounded text-xs">+</button>
      <button @click="zoom = Math.max(0.25, zoom - 0.25)" class="bg-black/50 text-white px-2 py-1 rounded text-xs">-</button>
    </div>
  </div>
</template>`

// ---------------------------------------------------------------------------
// Scenario definition
// ---------------------------------------------------------------------------

export const scenario: Scenario = {
  title: 'HADLC Demo',
  phases: [
    // ======================================================================
    // Phase 1: Early Convergence
    // ======================================================================
    {
      id: 1,
      name: 'Early Convergence',
      steps: [
        // --- Seed drops ---
        {
          id: 'p1-01',
          teams: {
            from: { role: 'PM', name: 'David Wang' },
            text: 'New requirement from stakeholder meeting: customers need to visualize where their security cameras are placed in buildings. They\'re managing camera positions in spreadsheets and hand-drawn maps. We need interactive floor plans with camera positions and live preview.',
          },
        },
        {
          id: 'p1-02',
          finder: {
            entries: [
              { path: 'requirements', type: 'folder' },
              { path: 'requirements/emap-seed.md', type: 'file' },
            ],
          },
          vscode: {
            action: 'open-file',
            path: 'requirements/emap-seed.md',
            content: SEED_CONTENT,
            language: 'markdown',
          },
        },
        {
          id: 'p1-03',
          teams: {
            from: { role: 'ADM', name: 'Sarah Chen' },
            text: 'Good seed with clear pain point. Let me kick off a brainstorming session with the agent to clarify open questions and produce an actionable MVP scope for the team.',
          },
        },
        // --- Brainstorming starts ---
        {
          id: 'p1-04',
          claude: {
            action: 'command',
            text: '/superpowers:brainstorming load skill vortex and skill openspec-prototype, given this requirement seed (requirements/emap-seed.md), discuss with me how to fulfill the requirement in our system and provide an actionable MVP prototype for the team to review and produce a clarified refined-requirement.md',
          },
        },
        {
          id: 'p1-05',
          claude: {
            action: 'output',
            lines: [
              { text: 'Loading skill: vortex...', color: 'cyan' },
              { text: 'Loading skill: openspec-prototype...', color: 'cyan' },
              { text: 'Reading seed: requirements/emap-seed.md', color: 'white' },
              { text: 'Analyzing seed: 5 open questions found', color: 'white' },
              { text: 'Starting interactive Q&A to clarify scope and produce MVP prototype...', color: 'yellow' },
            ],
          },
        },
        // --- Q&A Round 1: Technical (image formats + size) ---
        {
          id: 'p1-06',
          claude: {
            action: 'output',
            lines: [
              { text: '', color: 'white' },
              { text: 'Q1: Which image formats should floor plans support?', color: 'cyan' },
              { text: '  a) JPEG + PNG + SVG (broad compatibility)', color: 'white' },
              { text: '  b) JPEG + SVG only (simpler pipeline)', color: 'white' },
              { text: '  c) SVG only (vector-first approach)', color: 'white' },
              { text: '  Also: any file size limit?', color: 'cyan' },
            ],
          },
        },
        {
          id: 'p1-07',
          teams: {
            from: { role: 'RD', name: 'James Liu' },
            text: 'b) JPEG + SVG only. PNG files are larger for similar quality and we don\'t need transparency for floor plans. Max 10MB per file -- that covers high-res scanned blueprints.',
          },
        },
        // --- Q&A Round 2: UX/Scope (interactivity + mobile) ---
        {
          id: 'p1-08',
          claude: {
            action: 'output',
            lines: [
              { text: '', color: 'white' },
              { text: 'Q2: What level of interactivity for MVP?', color: 'cyan' },
              { text: '  a) Read-only viewer (static camera pins on floor plan)', color: 'white' },
              { text: '  b) Interactive editor (drag-and-drop + FOV overlay)', color: 'white' },
              { text: '  Follow-up: should mobile support editing?', color: 'cyan' },
            ],
          },
        },
        {
          id: 'p1-09',
          teams: {
            from: { role: 'UX', name: 'Emma Park' },
            text: 'Definitely b) interactive editor -- customers asked for drag-and-drop. But we need separate Edit and View modes to prevent accidental edits during monitoring. Mobile should be view-only; touch-based FOV editing is too imprecise.',
          },
        },
        // --- Q&A Round 3: Business (limits + sharing + streams) ---
        {
          id: 'p1-10',
          claude: {
            action: 'output',
            lines: [
              { text: '', color: 'white' },
              { text: 'Q3: Scale and sharing model?', color: 'cyan' },
              { text: '  - Floor plan limit per site? (some sites have many areas)', color: 'white' },
              { text: '  - Can one camera appear on multiple floor plans?', color: 'white' },
              { text: '  - Live stream concurrency from floor plan view?', color: 'white' },
            ],
          },
        },
        {
          id: 'p1-11',
          teams: {
            from: { role: 'PM', name: 'David Wang' },
            text: 'Max 10 floor plans per site -- covers most buildings. Yes, same camera can appear on multiple plans with independent FOV configs (hallway cameras visible from two floors). Single live stream at a time for bandwidth.',
          },
        },
        // --- Agent synthesizes answers into prototype ---
        {
          id: 'p1-12',
          claude: {
            action: 'output',
            lines: [
              { text: '', color: 'white' },
              { text: 'All open questions resolved. Generating prototype...', color: 'green' },
              { text: '  Format: JPEG + SVG, max 10MB', color: 'white' },
              { text: '  Interaction: drag-and-drop + FOV sectors', color: 'white' },
              { text: '  Modes: Edit (placement) / View (monitoring)', color: 'white' },
              { text: '  Limits: 10 plans/site, 1 live stream', color: 'white' },
              { text: 'Rendering clickable prototype...', color: 'cyan' },
            ],
          },
        },
        {
          id: 'p1-13',
          description: 'Interactive prototype: floor plan editor with draggable cameras and FOV sectors',
          browser: {
            tab: 'prototype',
            state: 'cameras',
          },
        },
        // --- Team confirms direction ---
        {
          id: 'p1-14',
          teams: {
            from: { role: 'UX', name: 'Emma Park' },
            text: 'Prototype captures the interaction model well. The FOV sector visualization is clear. Camera view angle visualization -- confirmed needed for MVP.',
          },
        },
        // --- Agent produces refined-requirement.md ---
        {
          id: 'p1-15',
          claude: {
            action: 'output',
            lines: [
              { text: 'Synthesizing into refined requirements document...', color: 'cyan' },
              { text: '  6 decisions resolved from Q&A', color: 'green' },
              { text: '  5 constraints captured', color: 'green' },
              { text: '  7 non-goals explicitly excluded', color: 'green' },
              { text: '  6 acceptance criteria defined', color: 'green' },
              { text: '  Output: requirements/refined-requirement.md', color: 'cyan' },
            ],
          },
          finder: {
            entries: [
              { path: 'requirements/refined-requirement.md', type: 'file' },
            ],
          },
          vscode: {
            action: 'open-file',
            path: 'requirements/refined-requirement.md',
            content: REFINED_REQUIREMENT_CONTENT,
            language: 'markdown',
          },
        },
        {
          id: 'p1-16',
          teams: {
            from: { role: 'ADM', name: 'Sarah Chen' },
            text: 'Requirements refined. Handing off refined-requirement.md to inception phase.',
          },
          vscode: {
            action: 'close-file',
          },
        },
      ],
    },

    // ======================================================================
    // Phase 2: Agent-Oriented Inception
    // ======================================================================
    {
      id: 2,
      name: 'Agent-Oriented Inception',
      steps: [
        {
          id: 'p2-01',
          teams: {
            from: { role: 'ADM', name: 'Sarah Chen' },
            text: 'Refined requirements approved. Starting agent-oriented inception for E-Map Floor Plan Management.',
          },
        },
        {
          id: 'p2-02',
          claude: {
            action: 'command',
            text: '/openspec:proposal --requirements requirements/refined-requirement.md',
          },
        },
        {
          id: 'p2-03',
          claude: {
            action: 'output',
            lines: [
              { text: 'Analyzing refined requirements...', color: 'cyan' },
              { text: 'Identified 3 capability areas:', color: 'white' },
              { text: '  - site-organization (hierarchy and search)', color: 'white' },
              { text: '  - floor-plan-management (CRUD, image upload, modes)', color: 'white' },
              { text: '  - camera-visualization (placement, FOV, live view)', color: 'white' },
              { text: 'Generating proposal structure...', color: 'cyan' },
            ],
          },
        },
        {
          id: 'p2-04',
          finder: {
            entries: [
              { path: 'openspec', type: 'folder' },
              { path: 'openspec/changes', type: 'folder' },
              { path: 'openspec/changes/add-floor-plan-management', type: 'folder' },
            ],
          },
        },
        {
          id: 'p2-05',
          finder: {
            entries: [
              { path: 'openspec/changes/add-floor-plan-management/proposal.md', type: 'file' },
            ],
          },
          vscode: {
            action: 'open-file',
            path: 'openspec/changes/add-floor-plan-management/proposal.md',
            content: PROPOSAL_CONTENT,
            language: 'markdown',
          },
        },
        {
          id: 'p2-06',
          claude: {
            action: 'output',
            lines: [
              { text: 'Proposal generated successfully', color: 'green' },
              { text: '  Affected specs: 3 new specs identified', color: 'white' },
              { text: '  Impact: backend, frontend, mobile, database, storage', color: 'white' },
              { text: '  Breaking changes: none', color: 'green' },
              { text: '  Output: openspec/changes/add-floor-plan-management/proposal.md', color: 'cyan' },
            ],
          },
        },
        {
          id: 'p2-07',
          teams: {
            from: { role: 'ADM', name: 'Sarah Chen' },
            text: 'Proposal draft ready. Starting cross-functional review.',
          },
        },
        {
          id: 'p2-08',
          teams: {
            from: { role: 'RD', name: 'James Liu' },
            text: 'Good proposal. We need to think about the data model for device positions -- especially that cameras can appear on multiple floor plans with independent FOV configs. Also, what about concurrent editing conflicts?',
          },
        },
        {
          id: 'p2-09',
          teams: {
            from: { role: 'UX', name: 'Emma Park' },
            text: 'We should support 5 device types on the floor plan: Camera, NVR, Bridge, Network Speaker, and PoE Switch. Only cameras get FOV overlays though. Also need to distinguish Available vs Placed tabs in the device panel.',
          },
        },
        {
          id: 'p2-10',
          claude: {
            action: 'output',
            lines: [
              { text: 'Generating design document with review decisions...', color: 'cyan' },
              { text: '  Decision 1: Capability segmentation (3 specs)', color: 'white' },
              { text: '  Decision 2: Image formats (JPEG + SVG only, no PNG)', color: 'white' },
              { text: '  Decision 3: Floor plan limit (10 per site)', color: 'white' },
              { text: '  Decision 4: Single live stream limitation', color: 'white' },
              { text: '  Decision 5: Multi-floor plan device positions', color: 'white' },
              { text: '  Decision 6: FOV sector model (angle, direction, depth)', color: 'white' },
              { text: '  Decision 7: Edit vs View mode separation', color: 'white' },
            ],
          },
        },
        {
          id: 'p2-11',
          finder: {
            entries: [
              { path: 'openspec/changes/add-floor-plan-management/design.md', type: 'file' },
            ],
          },
          vscode: {
            action: 'open-file',
            path: 'openspec/changes/add-floor-plan-management/design.md',
            content: DESIGN_CONTENT,
            language: 'markdown',
          },
        },
        {
          id: 'p2-12',
          claude: {
            action: 'output',
            lines: [
              { text: 'Design document generated', color: 'green' },
              { text: '  7 architectural decisions documented', color: 'white' },
              { text: '  Data model: FloorPlan + DevicePosition entities', color: 'white' },
              { text: '  9 API endpoints defined', color: 'white' },
              { text: '  3 risks identified with mitigations', color: 'white' },
            ],
          },
        },
        {
          id: 'p2-13',
          teams: {
            from: { role: 'PM', name: 'David Wang' },
            text: 'Design looks comprehensive. The capability segmentation makes sense and the data model handles the multi-floor-plan camera case well. Approved.',
            isApproval: true,
          },
        },
        // --- Generate behavioral specs from design ---
        {
          id: 'p2-14',
          claude: {
            action: 'command',
            text: '/openspec:apply --change add-floor-plan-management',
          },
        },
        {
          id: 'p2-15',
          claude: {
            action: 'output',
            lines: [
              { text: 'Generating behavioral specs from design...', color: 'cyan' },
              { text: '  Spec 1: floor-plan-management (CRUD, upload, modes)', color: 'white' },
              { text: '  Spec 2: camera-visualization (position, FOV, live view)', color: 'white' },
              { text: '  Spec 3: site-organization (hierarchy, search, limits)', color: 'white' },
            ],
          },
        },
        {
          id: 'p2-16',
          finder: {
            entries: [
              { path: 'openspec/specs', type: 'folder' },
              { path: 'openspec/specs/floor-plan-management', type: 'folder' },
              { path: 'openspec/specs/floor-plan-management/spec.md', type: 'file' },
            ],
          },
          vscode: {
            action: 'open-file',
            path: 'openspec/specs/floor-plan-management/spec.md',
            content: SPEC_FLOOR_PLAN_CONTENT,
            language: 'markdown',
          },
        },
        {
          id: 'p2-17',
          finder: {
            entries: [
              { path: 'openspec/specs/camera-visualization', type: 'folder' },
              { path: 'openspec/specs/camera-visualization/spec.md', type: 'file' },
            ],
          },
          vscode: {
            action: 'open-file',
            path: 'openspec/specs/camera-visualization/spec.md',
            content: SPEC_CAMERA_VIS_CONTENT,
            language: 'markdown',
          },
        },
        {
          id: 'p2-18',
          finder: {
            entries: [
              { path: 'openspec/specs/site-organization', type: 'folder' },
              { path: 'openspec/specs/site-organization/spec.md', type: 'file' },
            ],
          },
          vscode: {
            action: 'open-file',
            path: 'openspec/specs/site-organization/spec.md',
            content: SPEC_SITE_ORG_CONTENT,
            language: 'markdown',
          },
        },
        {
          id: 'p2-19',
          claude: {
            action: 'output',
            lines: [
              { text: '3 behavioral specs generated', color: 'green' },
              { text: '  floor-plan-management: 4 requirements, 10 scenarios', color: 'white' },
              { text: '  camera-visualization: 7 requirements, 14 scenarios', color: 'white' },
              { text: '  site-organization: 3 requirements, 5 scenarios', color: 'white' },
            ],
          },
        },
        // --- Spec review ---
        {
          id: 'p2-20',
          teams: {
            from: { role: 'RD', name: 'James Liu' },
            text: 'Specs look solid. The WHEN/THEN scenarios are testable. One thing: the camera-visualization spec should clarify that FOV overlay is only rendered for cameras, not NVR or other device types.',
          },
        },
        {
          id: 'p2-21',
          teams: {
            from: { role: 'UX', name: 'Emma Park' },
            text: 'Good coverage. The edit/view mode scenarios in floor-plan-management match our interaction model. The camera status display scenarios (online/offline/updating) align with the design system colors.',
          },
        },
        {
          id: 'p2-22',
          teams: {
            from: { role: 'ADM', name: 'Sarah Chen' },
            text: 'Proposal, design, and 3 behavioral specs all reviewed and approved. Handing off to breakdown phase for API and UI design generation.',
          },
        },
      ],
    },

    // ======================================================================
    // Phase 3: Breakdown
    // ======================================================================
    {
      id: 3,
      name: 'Breakdown',
      steps: [
        {
          id: 'p3-01',
          claude: {
            action: 'command',
            text: '/hadlc:breakdown --specs openspec/specs/ --change add-floor-plan-management',
          },
        },
        {
          id: 'p3-02',
          claude: {
            action: 'output',
            lines: [
              { text: 'Reading 3 behavioral specs...', color: 'cyan' },
              { text: '  floor-plan-management: 4 requirements, 10 scenarios', color: 'white' },
              { text: '  camera-visualization: 7 requirements, 14 scenarios', color: 'white' },
              { text: '  site-organization: 3 requirements, 5 scenarios', color: 'white' },
              { text: 'Generating OpenAPI specification from specs...', color: 'cyan' },
              { text: '  10 endpoints across 3 tags', color: 'white' },
              { text: '  RFC 9457 Problem Details for errors', color: 'white' },
              { text: '  JWT bearer authentication', color: 'white' },
            ],
          },
        },
        {
          id: 'p3-03',
          finder: {
            entries: [
              { path: 'openspec/changes/add-floor-plan-management/openapi.yaml', type: 'file' },
            ],
          },
          vscode: {
            action: 'open-file',
            path: 'openspec/changes/add-floor-plan-management/openapi.yaml',
            content: OPENAPI_CONTENT,
            language: 'typescript',
          },
        },
        {
          id: 'p3-04',
          browser: {
            tab: 'api-docs',
            endpoints: [
              { method: 'GET', path: '/sites/{siteId}/floor-plans', summary: 'List floor plans for a site' },
              { method: 'POST', path: '/sites/{siteId}/floor-plans', summary: 'Create a new floor plan' },
              { method: 'GET', path: '/floor-plans/{floorPlanId}', summary: 'Get floor plan details' },
              { method: 'PATCH', path: '/floor-plans/{floorPlanId}', summary: 'Update floor plan' },
              { method: 'DELETE', path: '/floor-plans/{floorPlanId}', summary: 'Delete floor plan' },
              { method: 'POST', path: '/floor-plans/{floorPlanId}/upload', summary: 'Upload floor plan image' },
            ],
          },
        },
        {
          id: 'p3-05',
          browser: {
            tab: 'api-docs',
            endpoints: [
              { method: 'GET', path: '/floor-plans/{floorPlanId}/device-positions', summary: 'List device positions' },
              { method: 'POST', path: '/floor-plans/{floorPlanId}/device-positions', summary: 'Position device on floor plan' },
              { method: 'PATCH', path: '/floor-plans/{floorPlanId}/device-positions/{id}', summary: 'Update device position/FOV' },
              { method: 'DELETE', path: '/floor-plans/{floorPlanId}/device-positions/{id}', summary: 'Remove device from floor plan' },
            ],
          },
        },
        // --- Feedback loop: API review catches spec mismatches ---
        {
          id: 'p3-06',
          teams: {
            from: { role: 'RD', name: 'James Liu' },
            text: 'Hold on -- two issues in the API. First: design doc says device_ugly_id but the OpenAPI uses deviceSerialNumber. Which identifier form are we using? Second: the camera-visualization spec says FOV angle "between 10 and 360 degrees" but the OpenAPI schema says minimum: 0. Which is correct?',
          },
        },
        {
          id: 'p3-07',
          claude: {
            action: 'output',
            lines: [
              { text: 'Cross-referencing sources...', color: 'yellow' },
              { text: '', color: 'white' },
              { text: 'Issue 1: Identifier naming mismatch', color: 'red' },
              { text: '  design.md (Decision 5) -> device_ugly_id', color: 'white' },
              { text: '  openapi.yaml (schema)   -> deviceSerialNumber', color: 'white' },
              { text: '', color: 'white' },
              { text: 'Issue 2: FOV angle minimum mismatch', color: 'red' },
              { text: '  camera-visualization/spec.md -> min 10 degrees', color: 'white' },
              { text: '  openapi.yaml (fovAngle)      -> min 0 degrees', color: 'white' },
              { text: '', color: 'white' },
              { text: 'Awaiting team decision to resolve...', color: 'yellow' },
            ],
          },
        },
        {
          id: 'p3-08',
          teams: {
            from: { role: 'RD', name: 'James Liu' },
            text: 'Use deviceSerialNumber -- it\'s the thingName:derivant format our device service already exposes. The design doc used an older internal term.',
          },
        },
        {
          id: 'p3-09',
          teams: {
            from: { role: 'PM', name: 'David Wang' },
            text: 'For FOV angle: 0 should be valid. It means "camera placed but FOV not configured yet." Update the behavioral spec to say 0-360.',
          },
        },
        {
          id: 'p3-10',
          claude: {
            action: 'output',
            lines: [
              { text: 'Propagating fixes back to specs...', color: 'cyan' },
              { text: '  Updated: design.md -- device_ugly_id -> deviceSerialNumber', color: 'green' },
              { text: '  Updated: camera-visualization/spec.md -- FOV min 10 -> 0', color: 'green' },
              { text: '  Verified: openapi.yaml already correct on both', color: 'green' },
              { text: '  All artifacts now consistent', color: 'green' },
            ],
          },
          finder: {
            entries: [
              { path: 'openspec/changes/add-floor-plan-management/design.md', type: 'file', modified: true },
              { path: 'openspec/specs/camera-visualization/spec.md', type: 'file', modified: true },
            ],
          },
        },
        // --- Continue with UI flow generation ---
        {
          id: 'p3-11',
          claude: {
            action: 'output',
            lines: [
              { text: 'Generating UI flow specification...', color: 'cyan' },
              { text: '  5 key pages: Navigation, Create Modal, View, Edit, BasicSettings', color: 'white' },
              { text: '  6 interaction flows documented', color: 'white' },
              { text: '  Permission matrix: 6 roles', color: 'white' },
            ],
          },
        },
        {
          id: 'p3-12',
          finder: {
            entries: [
              { path: 'openspec/changes/add-floor-plan-management/ui-flow.md', type: 'file' },
            ],
          },
          vscode: {
            action: 'open-file',
            path: 'openspec/changes/add-floor-plan-management/ui-flow.md',
            content: UI_FLOW_CONTENT,
            language: 'markdown',
          },
        },
        // --- Pencil: generate .pen designs from specs ---
        {
          id: 'p3-13',
          claude: {
            action: 'command',
            text: '/pencil:generate --specs openspec/specs/ --ui-flow ui-flow.md',
          },
        },
        {
          id: 'p3-14',
          claude: {
            action: 'output',
            lines: [
              { text: 'Generating .pen designs from 3 behavioral specs...', color: 'cyan' },
              { text: '  floor-plan-management.pen (4 screens: List, Create, Edit, Upload)', color: 'white' },
              { text: '  camera-visualization.pen (3 screens: Canvas, FOV Editor, Device Panel)', color: 'white' },
              { text: '  site-organization.pen (2 screens: Site Tree, Assignment)', color: 'white' },
              { text: 'All .pen files saved to designs/', color: 'green' },
            ],
          },
          finder: {
            entries: [
              { path: 'designs', type: 'folder' },
              { path: 'designs/floor-plan-management.pen', type: 'file' },
              { path: 'designs/camera-visualization.pen', type: 'file' },
              { path: 'designs/site-organization.pen', type: 'file' },
            ],
          },
        },
        {
          id: 'p3-15',
          pencil: {
            action: 'show-design',
            file: 'floor-plan-management.pen',
            screens: [
              {
                name: 'List View',
                elements: [
                  { label: 'Site Selector', x: 2, y: 2, w: 20, h: 6 },
                  { label: 'Floor Plan Grid', x: 2, y: 12, w: 96, h: 70, color: '#6366f1' },
                  { label: '+ Create Plan', x: 78, y: 2, w: 20, h: 6, color: '#22c55e' },
                  { label: 'Card: Lobby', x: 4, y: 16, w: 28, h: 30, color: '#6366f1' },
                  { label: 'Card: Floor 2', x: 36, y: 16, w: 28, h: 30, color: '#6366f1' },
                  { label: 'Card: Parking', x: 68, y: 16, w: 28, h: 30, color: '#6366f1' },
                  { label: 'Pagination', x: 30, y: 85, w: 40, h: 5, color: '#94a3b8' },
                ],
              },
            ],
          },
        },
        {
          id: 'p3-16',
          pencil: {
            action: 'show-design',
            file: 'camera-visualization.pen',
            screens: [
              {
                name: 'Canvas View',
                elements: [
                  { label: 'Toolbar', x: 2, y: 2, w: 70, h: 6, color: '#94a3b8' },
                  { label: 'Floor Plan Canvas', x: 2, y: 10, w: 70, h: 82, color: '#6366f1' },
                  { label: 'FOV Cone Overlay', x: 15, y: 25, w: 25, h: 30, color: '#f59e0b' },
                  { label: 'Device Panel', x: 74, y: 2, w: 24, h: 90, color: '#8b5cf6' },
                  { label: 'Tab: Available', x: 75, y: 6, w: 11, h: 4, color: '#22c55e' },
                  { label: 'Tab: Placed', x: 87, y: 6, w: 10, h: 4, color: '#94a3b8' },
                  { label: 'Camera List', x: 75, y: 12, w: 22, h: 70, color: '#8b5cf6' },
                  { label: 'Zoom Controls', x: 60, y: 85, w: 12, h: 6, color: '#94a3b8' },
                ],
              },
            ],
          },
        },
        {
          id: 'p3-17',
          pencil: {
            action: 'show-design',
            file: 'site-organization.pen',
            screens: [
              {
                name: 'Site Tree',
                elements: [
                  { label: 'Site Tree Sidebar', x: 2, y: 2, w: 25, h: 90, color: '#8b5cf6' },
                  { label: 'HQ (expanded)', x: 4, y: 8, w: 20, h: 5, color: '#6366f1' },
                  { label: 'Branch A', x: 6, y: 15, w: 18, h: 4, color: '#94a3b8' },
                  { label: 'Branch B', x: 6, y: 21, w: 18, h: 4, color: '#94a3b8' },
                  { label: 'Floor Plan Grid', x: 30, y: 2, w: 68, h: 55, color: '#6366f1' },
                  { label: 'Assign Floor Plan', x: 30, y: 60, w: 30, h: 6, color: '#22c55e' },
                  { label: 'Properties Panel', x: 30, y: 70, w: 68, h: 24, color: '#94a3b8' },
                ],
              },
            ],
          },
        },
        {
          id: 'p3-18',
          browser: {
            tab: 'prototype',
            state: 'skeleton',
          },
        },
        {
          id: 'p3-19',
          teams: {
            from: { role: 'UX', name: 'Emma Park' },
            text: 'UI flow spec and .pen designs look thorough. The Available vs Placed tabs in the device panel make sense. FOV overlay is clear. One note: the permission matrix should also cover SUPERVISOR role for group-specific access.',
          },
        },
        {
          id: 'p3-20',
          teams: {
            from: { role: 'ADM', name: 'Sarah Chen' },
            text: 'Breakdown complete. Spec mismatches caught and fixed during API review. 3 behavioral specs, OpenAPI with 10 endpoints, UI flow, and 3 .pen design files all consistent and approved.',
          },
        },
      ],
    },

    // ======================================================================
    // Phase 4: Construction
    // ======================================================================
    {
      id: 4,
      name: 'Construction',
      steps: [
        // === Backend Track: openspec:proposal cycle ===
        {
          id: 'p4-01',
          claude: {
            action: 'command',
            text: 'git worktree add ../emap-feature feature/emap-floor-plan',
          },
        },
        {
          id: 'p4-02',
          claude: {
            action: 'output',
            lines: [
              { text: 'Created worktree: ../emap-feature', color: 'green' },
              { text: 'Switched to branch: feature/emap-floor-plan', color: 'white' },
            ],
          },
        },
        {
          id: 'p4-03',
          claude: {
            action: 'command',
            text: '/openspec:proposal --context backend/openspec/ --input openapi.yaml,specs/*.md\n/superpowers:brainstorming generate backend proposal with DynamoDB schema design, S3 upload strategy, and error handling patterns',
          },
        },
        {
          id: 'p4-04',
          claude: {
            action: 'output',
            lines: [
              { text: 'Loading skills: openspec, superpowers, vortex-api...', color: 'cyan' },
              { text: 'Reading inputs:', color: 'white' },
              { text: '  openapi.yaml (10 endpoints, 3 tags)', color: 'white' },
              { text: '  specs/floor-plan-management/spec.md (4 req, 10 scenarios)', color: 'white' },
              { text: '  specs/camera-visualization/spec.md (7 req, 14 scenarios)', color: 'white' },
              { text: '  specs/site-organization/spec.md (3 req, 5 scenarios)', color: 'white' },
              { text: '', color: 'white' },
              { text: 'Brainstorming backend architecture decisions...', color: 'yellow' },
              { text: '  Storage: DynamoDB single-table (PK=SITE#, SK=FP#)', color: 'white' },
              { text: '  Images: S3 presigned URLs, 10MB limit, JPEG/PNG/SVG', color: 'white' },
              { text: '  Compute: Lambda behind API Gateway (existing pattern)', color: 'white' },
              { text: '  Errors: RFC 9457 Problem Details (vortex standard)', color: 'white' },
              { text: '', color: 'white' },
              { text: 'Backend proposal generated', color: 'green' },
            ],
          },
        },
        {
          id: 'p4-05',
          finder: {
            entries: [
              { path: 'backend/openspec', type: 'folder' },
              { path: 'backend/openspec/changes', type: 'folder' },
              { path: 'backend/openspec/changes/add-floor-plan-management', type: 'folder' },
              { path: 'backend/openspec/changes/add-floor-plan-management/proposal.md', type: 'file' },
            ],
          },
          vscode: {
            action: 'open-file',
            path: 'backend/openspec/changes/add-floor-plan-management/proposal.md',
            content: `# Backend Proposal: Floor Plan Management API

## Context
Implement backend services for E-Map floor plan management.
Input: openapi.yaml (10 endpoints), 3 behavioral specs (29 scenarios total).

## Scope
- Floor plan CRUD with site-scoped access control
- Image upload pipeline (S3 presigned URL flow)
- Device position management with normalized coordinates
- FOV angle configuration (0-360 degrees)

## Technical Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | DynamoDB single-table design | PK=SITE#{siteId}, SK=FP#{floorPlanId} -- matches existing vortex-device-service pattern |
| 2 | S3 presigned URLs for upload | Client uploads directly to S3, Lambda validates metadata -- avoids 10MB payload through API Gateway |
| 3 | Lambda + API Gateway | Existing compute pattern in vortex platform, reuse shared middleware |
| 4 | RFC 9457 Problem Details | Platform standard for error responses, already used by device-service |
| 5 | Normalized coordinates (0-1) | Device positions stored as ratios -- resolution-independent |

## Affected Code
- **NEW**: \`services/floor-plan-service.ts\` -- Express routes + handlers
- **NEW**: \`models/floor-plan.ts\` -- DynamoDB entity definitions
- **NEW**: \`middleware/upload.ts\` -- S3 presigned URL generation
- **MOD**: \`services/device-service.ts\` -- Add position lookup by floor plan

## Non-Goals
- Real-time collaboration (future phase)
- Floor plan versioning (v1 overwrites)`,
            language: 'markdown',
          },
        },
        {
          id: 'p4-06',
          teams: {
            from: { role: 'RD', name: 'James Liu' },
            text: 'Backend proposal looks solid. Single-table DynamoDB with SITE#/FP# partition matches our existing device-service pattern. S3 presigned URL flow for uploads avoids the API Gateway 10MB limit. Approved.',
          },
        },
        {
          id: 'p4-07',
          claude: {
            action: 'command',
            text: '/openspec:apply --change backend/openspec/changes/add-floor-plan-management/',
          },
        },
        {
          id: 'p4-08',
          claude: {
            action: 'output',
            lines: [
              { text: 'Generating backend design from approved proposal...', color: 'cyan' },
              { text: '  design.md: DynamoDB schema, S3 flow, middleware chain', color: 'white' },
              { text: '  spec.md: 14 backend-specific scenarios from 29 total', color: 'white' },
              { text: 'Generating implementation from design...', color: 'cyan' },
            ],
          },
          vscode: {
            action: 'open-file',
            path: 'backend/openspec/changes/add-floor-plan-management/design.md',
            content: `# Backend Design: Floor Plan Management

## DynamoDB Schema (Single-Table)
| Entity | PK | SK | Attributes |
|--------|----|----|------------|
| FloorPlan | SITE#{siteId} | FP#{floorPlanId} | name, imageUrl, dimensions, createdAt |
| DevicePosition | FP#{floorPlanId} | DEV#{deviceSerialNumber} | x, y, fovAngle, fovRange |

## S3 Upload Flow
1. Client calls POST /floor-plans/{id}/upload
2. Lambda generates presigned URL (5min TTL, 10MB max)
3. Client uploads directly to S3
4. S3 event triggers validation Lambda (format, dimensions)
5. Validation Lambda updates DynamoDB with imageUrl

## Middleware Chain
\`auth -> rateLimit -> validate(zod) -> handler -> errorHandler(RFC9457)\`

## Error Mapping
| Scenario | HTTP | Problem Type |
|----------|------|-------------|
| Floor plan not found | 404 | /problems/not-found |
| Duplicate device position | 409 | /problems/conflict |
| Image too large | 413 | /problems/payload-too-large |
| Invalid coordinates | 422 | /problems/validation-error |`,
            language: 'markdown',
          },
        },
        {
          id: 'p4-09',
          claude: {
            action: 'output',
            lines: [
              { text: 'Generating: floor-plan-service.ts', color: 'cyan' },
              { text: '  Routes: 10 endpoints from openapi.yaml', color: 'white' },
              { text: '  Validation: zod schemas from OpenAPI constraints', color: 'white' },
              { text: '  Models: FloorPlan, DevicePosition (normalized coords)', color: 'white' },
              { text: '  Error handling: RFC 9457 Problem Details', color: 'green' },
            ],
          },
          vscode: {
            action: 'open-file',
            path: 'services/floor-plan-service.ts',
            content: SERVICE_CODE,
            language: 'typescript',
          },
        },
        {
          id: 'p4-10',
          finder: {
            entries: [
              { path: 'services', type: 'folder' },
              { path: 'services/floor-plan-service.ts', type: 'file' },
              { path: 'backend/openspec/changes/add-floor-plan-management/design.md', type: 'file' },
            ],
          },
          claude: {
            action: 'output',
            lines: [
              { text: 'Generating test suite from backend spec scenarios...', color: 'cyan' },
              { text: '  floor-plan-api.test.ts (14 test cases)', color: 'white' },
              { text: '  Coverage: CRUD, upload validation, device positions,', color: 'white' },
              { text: '    10-plan limit, position bounds, duplicate detection', color: 'green' },
            ],
          },
        },
        {
          id: 'p4-11',
          finder: {
            entries: [
              { path: 'tests', type: 'folder' },
              { path: 'tests/floor-plan-api.test.ts', type: 'file' },
            ],
          },
          vscode: {
            action: 'open-file',
            path: 'tests/floor-plan-api.test.ts',
            content: TEST_CODE,
            language: 'typescript',
          },
        },
        // --- Feedback loop: tests reveal missing spec scenario ---
        {
          id: 'p4-12',
          claude: {
            action: 'command',
            text: 'pnpm vitest run tests/floor-plan-api.test.ts',
          },
        },
        {
          id: 'p4-13',
          claude: {
            action: 'output',
            lines: [
              { text: 'Running 14 tests...', color: 'cyan' },
              { text: '  PASS  GET /sites/:siteId/floor-plans (2 tests)', color: 'green' },
              { text: '  PASS  POST /sites/:siteId/floor-plans (3 tests)', color: 'green' },
              { text: '  PASS  POST /floor-plans/:id/device-positions (3 tests)', color: 'green' },
              { text: '  PASS  POST /floor-plans/:id/upload (2 tests)', color: 'green' },
              { text: '  FAIL  PATCH /floor-plans/:id (1 test)', color: 'red' },
              { text: '', color: 'white' },
              { text: '  x update non-existent floor plan returns 404', color: 'red' },
              { text: '    Expected: 404 with RFC 9457 Problem Details', color: 'red' },
              { text: '    Received: no matching scenario in spec', color: 'red' },
              { text: '', color: 'white' },
              { text: 'Tests: 13 passed, 1 failed', color: 'yellow' },
            ],
          },
        },
        {
          id: 'p4-14',
          claude: {
            action: 'output',
            lines: [
              { text: 'Tracing failure to backend spec...', color: 'yellow' },
              { text: '  backend spec -> "Update floor plan name"', color: 'white' },
              { text: '  Only defines happy path: validation + update', color: 'white' },
              { text: '  Missing scenario: floor plan not found (404)', color: 'red' },
              { text: '', color: 'white' },
              { text: 'Gap: backend spec does not define error behavior for', color: 'yellow' },
              { text: '  non-existent resources. Adding missing scenario...', color: 'yellow' },
            ],
          },
        },
        {
          id: 'p4-15',
          claude: {
            action: 'output',
            lines: [
              { text: 'Updated: backend spec + high-level spec', color: 'green' },
              { text: '  + Scenario: Update non-existent floor plan', color: 'green' },
              { text: '    WHEN user updates a floor plan that does not exist', color: 'white' },
              { text: '    THEN system returns 404 Not Found', color: 'white' },
              { text: '    AND response follows RFC 9457 Problem Details', color: 'white' },
              { text: '', color: 'white' },
              { text: 'Regenerating test to match updated spec...', color: 'cyan' },
            ],
          },
          finder: {
            entries: [
              { path: 'openspec/specs/floor-plan-management/spec.md', type: 'file', modified: true },
              { path: 'tests/floor-plan-api.test.ts', type: 'file', modified: true },
            ],
          },
        },
        {
          id: 'p4-16',
          claude: {
            action: 'output',
            lines: [
              { text: 'Re-running tests...', color: 'cyan' },
              { text: '  PASS  GET /sites/:siteId/floor-plans (2 tests)', color: 'green' },
              { text: '  PASS  POST /sites/:siteId/floor-plans (3 tests)', color: 'green' },
              { text: '  PASS  PATCH /floor-plans/:id (2 tests)', color: 'green' },
              { text: '  PASS  POST /floor-plans/:id/device-positions (3 tests)', color: 'green' },
              { text: '  PASS  POST /floor-plans/:id/upload (2 tests)', color: 'green' },
              { text: '', color: 'white' },
              { text: 'Tests: 14 passed, 0 failed', color: 'green' },
            ],
          },
        },
        {
          id: 'p4-17',
          browser: {
            tab: 'prototype',
            state: 'cameras',
          },
          teams: {
            from: { role: 'RD', name: 'James Liu' },
            text: 'Backend PR ready for review. 10 endpoints matching OpenAPI spec, 14 test cases all green -- including the 404 scenario we caught during testing. Backend spec and high-level spec both updated.',
          },
        },
        // === Frontend Track: openspec:proposal cycle with .pen files ===
        {
          id: 'p4-18',
          claude: {
            action: 'command',
            text: '/openspec:proposal --context frontend/openspec/ --input openapi.yaml,specs/*.md,designs/*.pen',
          },
        },
        {
          id: 'p4-19',
          claude: {
            action: 'output',
            lines: [
              { text: 'Loading skills: openspec, hadlc-ux-design...', color: 'cyan' },
              { text: 'Reading inputs:', color: 'white' },
              { text: '  openapi.yaml (10 endpoints -- API contract)', color: 'white' },
              { text: '  specs/*.md (3 behavioral specs -- requirements)', color: 'white' },
              { text: '  designs/floor-plan-management.pen (4 screens)', color: 'white' },
              { text: '  designs/camera-visualization.pen (3 screens)', color: 'white' },
              { text: '  designs/site-organization.pen (2 screens)', color: 'white' },
              { text: '', color: 'white' },
              { text: 'Generating frontend proposal...', color: 'yellow' },
              { text: '  Component architecture: 3 page components + 8 shared', color: 'white' },
              { text: '  State: Pinia stores for floorPlan, devices, site', color: 'white' },
              { text: '  Canvas: SVG-based renderer (FOV cones, drag-drop)', color: 'white' },
              { text: '', color: 'white' },
              { text: 'Frontend proposal generated', color: 'green' },
            ],
          },
        },
        {
          id: 'p4-20',
          finder: {
            entries: [
              { path: 'frontend/openspec', type: 'folder' },
              { path: 'frontend/openspec/changes', type: 'folder' },
              { path: 'frontend/openspec/changes/add-floor-plan-management', type: 'folder' },
              { path: 'frontend/openspec/changes/add-floor-plan-management/proposal.md', type: 'file' },
            ],
          },
          vscode: {
            action: 'open-file',
            path: 'frontend/openspec/changes/add-floor-plan-management/proposal.md',
            content: `# Frontend Proposal: Floor Plan Management UI

## Context
Implement frontend for E-Map floor plan management.
Input: openapi.yaml (API contract), 3 behavioral specs, 3 .pen design files (9 screens total).

## Scope
- Floor plan list/create/edit pages (from floor-plan-management.pen)
- Interactive canvas with FOV visualization (from camera-visualization.pen)
- Site tree navigation + floor plan assignment (from site-organization.pen)

## Technical Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Vue 3 Composition API | Existing platform standard |
| 2 | SVG-based canvas renderer | FOV cones require arc paths -- SVG \`<path>\` is simpler than Canvas 2D for interactive hit-testing |
| 3 | Pinia stores (floorPlan, devices, site) | Shared state across canvas + panel + tree components |
| 4 | Drag-drop via pointer events | Consistent with canvas pan/zoom -- single event system |
| 5 | .pen -> component mapping | Each .pen screen maps to one page component; shared elements become slot components |

## Component Architecture (from .pen files)
- \`FloorPlanListPage.vue\` <- floor-plan-management.pen/List View
- \`FloorPlanEditorPage.vue\` <- camera-visualization.pen/Canvas View
- \`SiteTreePage.vue\` <- site-organization.pen/Site Tree
- \`DevicePanel.vue\` (shared) <- camera-visualization.pen/Device Panel
- \`FovOverlay.vue\` (shared) <- camera-visualization.pen/FOV Cone Overlay
- \`FloorPlanCard.vue\` (shared) <- floor-plan-management.pen/Card elements

## Non-Goals
- Offline support (future phase)
- Mobile-responsive canvas (desktop-first for v1)`,
            language: 'markdown',
          },
        },
        {
          id: 'p4-21',
          teams: {
            from: { role: 'UX', name: 'Emma Park' },
            text: 'Frontend proposal maps well to the .pen designs. SVG for FOV cones makes sense -- we need arc-path hit-testing for click-to-select. Component mapping from .pen screens is clear. Approved.',
          },
        },
        {
          id: 'p4-22',
          claude: {
            action: 'command',
            text: '/openspec:apply --change frontend/openspec/changes/add-floor-plan-management/',
          },
        },
        {
          id: 'p4-23',
          claude: {
            action: 'output',
            lines: [
              { text: 'Reading .pen designs for component generation...', color: 'cyan' },
              { text: '  floor-plan-management.pen -> FloorPlanListPage.vue', color: 'white' },
              { text: '  camera-visualization.pen -> FloorPlanEditorPage.vue + FovOverlay.vue', color: 'white' },
              { text: '  site-organization.pen -> SiteTreePage.vue', color: 'white' },
              { text: '  Shared: DevicePanel.vue, FloorPlanCard.vue', color: 'white' },
              { text: '  Modes: view (live stream, status) + edit (placement, FOV)', color: 'white' },
              { text: '  Device types: Camera, NVR, Bridge, Speaker, PoE Switch', color: 'green' },
            ],
          },
          vscode: {
            action: 'open-file',
            path: 'components/FloorPlanEditor.vue',
            content: COMPONENT_CODE,
            language: 'typescript',
          },
        },
        {
          id: 'p4-24',
          finder: {
            entries: [
              { path: 'components', type: 'folder' },
              { path: 'components/FloorPlanEditor.vue', type: 'file' },
              { path: 'components/FloorPlanListPage.vue', type: 'file' },
              { path: 'components/SiteTreePage.vue', type: 'file' },
              { path: 'components/DevicePanel.vue', type: 'file' },
              { path: 'components/FovOverlay.vue', type: 'file' },
              { path: 'frontend/openspec/changes/add-floor-plan-management/proposal.md', type: 'file' },
            ],
          },
        },
        // === Wrap-up ===
        {
          id: 'p4-25',
          browser: {
            tab: 'prototype',
            state: 'interactive',
          },
          teams: {
            from: { role: 'ADM', name: 'Sarah Chen' },
            text: 'All tracks complete. Backend (own proposal cycle: 10 endpoints, 14 tests, spec fix propagated) and frontend (own proposal cycle: .pen-driven components, SVG canvas). Both tracks followed openspec:proposal -> review -> apply.',
          },
        },
        {
          id: 'p4-26',
          browser: {
            tab: 'prototype',
            state: 'final',
          },
          teams: {
            from: { role: 'ADM', name: 'Sarah Chen' },
            text: 'E-Map Floor Plan Management shipped. Each track ran its own spec-driven cycle with independent proposals, reviews, and implementation -- all traceable back to the 3 behavioral specs.',
          },
          vscode: {
            action: 'close-file',
          },
        },
      ],
    },
  ],
}
