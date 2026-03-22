# Label_Camera - System Architecture Document

**Version:** 1.0
**Date:** 2026-03-04
**Status:** Draft

---

## 1. Executive Summary

Label_Camera is a web application that enables users to capture multi-angle photographs of objects, assign custom labels/tags, search images by those tags, and perform reverse image recognition to identify objects in new photos.

### Key Capabilities
- Multi-angle photo capture and organization
- Flexible tag/label management
- Tag-based image search
- AI-powered image recognition for object identification

---

## 2. System Architecture Overview

```
+------------------+     +-------------------+     +------------------+
|                  |     |                   |     |                  |
|   Web Browser    |<--->|   Backend API     |<--->|   PostgreSQL     |
|   (Frontend)     |     |   (Node.js)       |     |   Database       |
|                  |     |                   |     |                  |
+------------------+     +--------+----------+     +------------------+
                                  |
                                  |
                    +-------------+-------------+
                    |             |             |
                    v             v             v
            +-----------+  +-----------+  +------------------+
            |  Image    |  |  Image    |  |  ML Recognition  |
            |  Storage  |  |  CDN      |  |  Service         |
            |  (S3/MinIO)| |  (CloudFront)| |  (Python/FastAPI)|
            +-----------+  +-----------+  +------------------+
                                                  |
                                                  v
                                          +--------------+
                                          | Vector DB    |
                                          | (Pinecone/   |
                                          |  Milvus)     |
                                          +--------------+
```

---

## 3. Technology Stack

### 3.1 Frontend

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Framework** | React 18+ with TypeScript | Strong ecosystem, type safety, component reusability |
| **State Management** | Zustand | Lightweight, minimal boilerplate, good for medium complexity |
| **UI Components** | Shadcn/ui + Tailwind CSS | Modern, accessible, customizable |
| **Image Capture** | MediaDevices API + react-webcam | Native browser camera access |
| **HTTP Client** | TanStack Query + Axios | Caching, optimistic updates, request deduplication |
| **Build Tool** | Vite | Fast HMR, optimized production builds |

### 3.2 Backend API

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Runtime** | Node.js 20 LTS | JavaScript ecosystem, async I/O, shared types with frontend |
| **Framework** | Fastify | High performance, schema validation, plugin architecture |
| **Language** | TypeScript | Type safety across the stack |
| **ORM** | Prisma | Type-safe queries, migrations, excellent DX |
| **Validation** | Zod + TypeBox | Runtime validation, shared schemas |
| **Authentication** | JWT + bcrypt | Stateless auth, secure password hashing |

### 3.3 Database

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Primary DB** | PostgreSQL 16 | ACID compliance, JSONB support, full-text search, mature |
| **Vector DB** | Pinecone (or Milvus self-hosted) | Efficient similarity search for image embeddings |
| **Caching** | Redis | Session storage, rate limiting, query caching |

### 3.4 Image Storage

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Object Storage** | AWS S3 (or MinIO self-hosted) | Scalable, durable, cost-effective |
| **CDN** | CloudFront (or Cloudflare) | Low-latency image delivery, edge caching |
| **Image Processing** | Sharp (Node.js) | Resize, compress, format conversion |

### 3.5 Image Recognition Service

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Framework** | FastAPI (Python) | Async, auto docs, ML ecosystem compatibility |
| **ML Model** | CLIP (OpenAI) + Fine-tuned classifier | Zero-shot capability, embedding generation |
| **Embedding Model** | ResNet-50 or ViT | Proven image feature extraction |
| **Inference** | PyTorch + ONNX Runtime | Production-ready model serving |

---

## 4. Database Schema

### 4.1 Entity Relationship Diagram

```
+---------------+       +---------------+       +---------------+
|     User      |       |     Image     |       |     Tag       |
+---------------+       +---------------+       +---------------+
| id (PK)       |<--->| user_id (FK)  |       | id (PK)       |
| email         |       | id (PK)       |<----->| name          |
| password_hash |       | storage_key   |       | created_at    |
| created_at    |       | original_name |       +---------------+
| updated_at    |       | mime_type     |
+---------------+       | size_bytes    |
                        | captured_at   |
                        | created_at    |
                        +---------------+
                              |
                              | (one-to-many)
                              v
                        +---------------+
                        |   ImageAngle  |
                        +---------------+
                        | id (PK)       |
                        | image_id (FK) |
                        | angle_degrees |
                        | storage_key   |
                        | is_primary    |
                        | created_at    |
                        +---------------+

+---------------+       +---------------+
|  ImageTag     |       | ImageEmbedding|
+---------------+       +---------------+
| image_id (FK) |       | image_id (FK) |
| tag_id (FK)   |       | embedding_id  |
| created_at    |       | vector ([]float32)|
+---------------+       | model_version |
                        | created_at    |
                        +---------------+
```

### 4.2 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  images        Image[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@map("users")
}

model Image {
  id            String      @id @default(cuid())
  userId        String      @map("user_id")
  storageKey    String      @map("storage_key")
  originalName  String?     @map("original_name")
  mimeType      String      @map("mime_type")
  sizeBytes     Int         @map("size_bytes")
  capturedAt    DateTime?   @map("captured_at")
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  angles        ImageAngle[]
  tags          ImageTag[]
  embedding     ImageEmbedding?

  @@index([userId])
  @@map("images")
}

model ImageAngle {
  id          String   @id @default(cuid())
  imageId     String   @map("image_id")
  angleDegrees Int     @map("angle_degrees")
  storageKey  String   @map("storage_key")
  isPrimary   Boolean  @default(false) @map("is_primary")
  createdAt   DateTime @default(now())

  image       Image    @relation(fields: [imageId], references: [id], onDelete: Cascade)

  @@unique([imageId, angleDegrees])
  @@map("image_angles")
}

model Tag {
  id        String    @id @default(cuid())
  name      String    @unique
  createdAt DateTime  @default(now())
  images    ImageTag[]

  @@map("tags")
}

model ImageTag {
  imageId   String   @map("image_id")
  tagId     String   @map("tag_id")
  createdAt DateTime @default(now())

  image     Image    @relation(fields: [imageId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([imageId, tagId])
  @@map("image_tags")
}

model ImageEmbedding {
  id           String   @id @default(cuid())
  imageId      String   @unique @map("image_id")
  embeddingId  String   @map("embedding_id") // Reference to vector DB
  modelVersion String   @map("model_version")
  createdAt    DateTime @default(now())

  image        Image    @relation(fields: [imageId], references: [id], onDelete: Cascade)

  @@map("image_embeddings")
}
```

---

## 5. API Design

### 5.1 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Authentication** |
| POST | `/api/auth/register` | Create new user account |
| POST | `/api/auth/login` | Authenticate user, return JWT |
| POST | `/api/auth/logout` | Invalidate session |
| **Images** |
| POST | `/api/images` | Upload new image with angles |
| GET | `/api/images` | List user's images (paginated) |
| GET | `/api/images/:id` | Get image details with angles |
| DELETE | `/api/images/:id` | Delete image |
| POST | `/api/images/:id/angles` | Add angle to existing image |
| **Tags** |
| POST | `/api/images/:id/tags` | Add tags to image |
| DELETE | `/api/images/:id/tags/:tagId` | Remove tag from image |
| GET | `/api/tags` | List all tags (autocomplete) |
| **Search** |
| GET | `/api/search?q=tag` | Search images by tag |
| GET | `/api/search/advanced` | Multi-criteria search |
| **Recognition** |
| POST | `/api/recognize` | Upload photo, get matching tags |

### 5.2 Request/Response Formats

#### Upload Image with Angles

```typescript
// POST /api/images
// Content-Type: multipart/form-data

interface UploadImageRequest {
  // Primary image file
  image: File;
  // Additional angle images
  angles?: {
    file: File;
    angleDegrees: number; // 0, 45, 90, 135, 180, 225, 270, 315
  }[];
  // Initial tags
  tags?: string[];
  // Metadata
  originalName?: string;
  capturedAt?: string; // ISO 8601
}

interface UploadImageResponse {
  id: string;
  userId: string;
  storageKey: string;
  originalName: string | null;
  mimeType: string;
  sizeBytes: number;
  capturedAt: string | null;
  createdAt: string;
  angles: {
    id: string;
    angleDegrees: number;
    storageKey: string;
    isPrimary: boolean;
  }[];
  tags: {
    id: string;
    name: string;
  }[];
}
```

#### Search Images by Tag

```typescript
// GET /api/search?q=tag1,tag2&match=all&page=1&limit=20

interface SearchRequest {
  q: string;           // Comma-separated tags
  match?: 'all' | 'any'; // Match all tags or any tag
  page?: number;       // Default: 1
  limit?: number;      // Default: 20, max: 100
}

interface SearchResponse {
  images: {
    id: string;
    thumbnailUrl: string;
    primaryAngleUrl: string;
    tags: { id: string; name: string }[];
    capturedAt: string | null;
    createdAt: string;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### Image Recognition

```typescript
// POST /api/recognize
// Content-Type: multipart/form-data

interface RecognizeRequest {
  image: File;
  // Optional: limit number of results
  limit?: number; // Default: 5
  // Optional: confidence threshold
  threshold?: number; // Default: 0.7, range: 0-1
}

interface RecognizeResponse {
  matches: {
    imageId: string;
    tag: string;
    confidence: number;
    matchedImageUrl: string;
  }[];
  processingTimeMs: number;
}
```

### 5.3 API Error Response Format

```typescript
interface ApiError {
  error: {
    code: string;        // e.g., "VALIDATION_ERROR", "NOT_FOUND"
    message: string;     // Human-readable message
    details?: unknown;   // Additional context
  };
  requestId: string;     // For debugging/tracing
  timestamp: string;
}
```

---

## 6. Data Flow Diagrams

### 6.1 Photo Upload and Labeling Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Browser │    │  Backend │    │  Storage │    │  Vector  │    │ Database │
│          │    │   API    │    │  (S3)    │    │   DB     │    │ (PG)     │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │               │
     │ 1. Upload     │               │               │               │
     │    images     │               │               │               │
     ├──────────────>│               │               │               │
     │               │               │               │               │
     │               │ 2. Validate   │               │               │
     │               │    & process  │               │               │
     │               ├──────────────>│               │               │
     │               │               │               │               │
     │               │ 3. Store      │               │               │
     │               │    images     │               │               │
     │               ├──────────────>│               │               │
     │               │               │               │               │
     │               │ 4. Return     │               │               │
     │               │    storage    │               │               │
     │               │<──────────────┤               │               │
     │               │               │               │               │
     │               │ 5. Generate   │               │               │
     │               │    embedding  │               │               │
     │               ├──────────────────────────────>│               │
     │               │               │               │               │
     │               │ 6. Store      │               │               │
     │               │    embedding  │               │               │
     │               │<──────────────────────────────┤               │
     │               │               │               │               │
     │               │ 7. Store      │               │               │
     │               │    metadata   │               │               │
     │               ├──────────────────────────────────────────────>│
     │               │               │               │               │
     │               │ 8. Confirm    │               │               │
     │               │<──────────────────────────────────────────────┤
     │               │               │               │               │
     │ 9. Return     │               │               │               │
     │    image ID   │               │               │               │
     │<──────────────┤               │               │               │
     │               │               │               │               │
     │ 10. Add tags  │               │               │               │
     ├──────────────>│               │               │               │
     │               │ 11. Store     │               │               │
     │               │     tags      │               │               │
     │               ├──────────────────────────────────────────────>│
     │               │               │               │               │
     │ 12. Confirm   │               │               │               │
     │<──────────────┤               │               │               │
     │               │               │               │               │
```

### 6.2 Tag-Based Search Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Browser │    │  Backend │    │  Redis   │    │ Database │
│          │    │   API    │    │  Cache   │    │   (PG)   │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │
     │ 1. Search     │               │               │
     │    request    │               │               │
     ├──────────────>│               │               │
     │               │               │               │
     │               │ 2. Check      │               │
     │               │    cache      │               │
     │               ├──────────────>│               │
     │               │               │               │
     │               │ 3. Cache miss │               │
     │               │<──────────────┤               │
     │               │               │               │
     │               │ 4. Query      │               │
     │               │    database   │               │
     │               ├──────────────────────────────>│
     │               │               │               │
     │               │ 5. Results    │               │
     │               │<──────────────────────────────┤
     │               │               │               │
     │               │ 6. Cache      │               │
     │               │    results    │               │
     │               ├──────────────>│               │
     │               │               │               │
     │               │ 7. Generate   │               │
     │               │    signed     │               │
     │               │    URLs       │               │
     │               │               │               │
     │ 8. Return     │               │               │
     │    results    │               │               │
     │<──────────────┤               │               │
     │               │               │               │
```

### 6.3 Image Recognition Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Browser │    │  Backend │    │   ML     │    │  Vector  │    │ Database │
│          │    │   API    │    │ Service  │    │   DB     │    │   (PG)   │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │               │
     │ 1. Upload     │               │               │               │
     │    query      │               │               │               │
     │    image      │               │               │               │
     ├──────────────>│               │               │               │
     │               │               │               │               │
     │               │ 2. Forward    │               │               │
     │               │    to ML      │               │               │
     │               ├──────────────>│               │               │
     │               │               │               │               │
     │               │               │ 3. Generate  │               │
     │               │               │    embedding │               │
     │               │               ├──────────────────────────────>│
     │               │               │               │               │
     │               │               │ 4. Vector    │               │
     │               │               │    search    │               │
     │               │               ├──────────────>│               │
     │               │               │               │               │
     │               │               │ 5. Similar   │               │
     │               │               │    vectors   │               │
     │               │               │<──────────────┤               │
     │               │               │               │               │
     │               │               │ 6. Return    │               │
     │               │               │    matches   │               │
     │               │<──────────────┤               │               │
     │               │               │               │               │
     │               │ 7. Enrich     │               │               │
     │               │    with tags  │               │               │
     │               ├──────────────────────────────────────────────>│
     │               │               │               │               │
     │               │ 8. Tag data   │               │               │
     │               │<──────────────────────────────────────────────┤
     │               │               │               │               │
     │ 9. Return     │               │               │               │
     │    matches    │               │               │               │
     │<──────────────┤               │               │               │
     │               │               │               │               │
```

---

## 7. ML Recognition Service Architecture

### 7.1 Service Design

```
                    +---------------------------+
                    |   FastAPI ML Service      |
                    +---------------------------+
                    |                           |
                    |  +---------------------+  |
                    |  |   Image Preprocessor|  |
                    |  |   - Resize to 224px |  |
                    |  |   - Normalize       |  |
                    |  |   - Augment         |  |
                    |  +----------+----------+  |
                    |             |             |
                    |  v----------+----------v  |
                    |  |   Embedding Model   |  |
                    |  |   (CLIP ViT-B/32)   |  |
                    |  +----------+----------+  |
                    |             |             |
                    |  v----------+----------v  |
                    |  |   Vector Index      |  |
                    |  |   (FAISS local or   |  |
                    |  |    Pinecone client) |  |
                    |  +---------------------+  |
                    |                           |
                    +---------------------------+
```

### 7.2 Recognition Pipeline

```python
# ml_service/pipeline.py

class RecognitionPipeline:
    """
    Image recognition pipeline:
    1. Preprocess incoming image
    2. Generate embedding using CLIP
    3. Query vector database for similar embeddings
    4. Retrieve associated tags from PostgreSQL
    5. Return ranked results with confidence scores
    """

    def __init__(self):
        self.preprocessor = ImagePreprocessor(target_size=224)
        self.embedding_model = CLIPEmbeddingModel()
        self.vector_store = VectorStoreClient()
        self.confidence_threshold = 0.7

    async def recognize(self, image_bytes: bytes, limit: int = 5) -> list[Match]:
        # Step 1: Preprocess
        processed = self.preprocessor.process(image_bytes)

        # Step 2: Generate embedding
        embedding = await self.embedding_model.embed(processed)

        # Step 3: Vector search
        similar = await self.vector_store.search(
            embedding=embedding,
            top_k=limit * 2,  # Fetch extra for filtering
            namespace=f"user_{user_id}"
        )

        # Step 4: Filter by confidence
        matches = [
            m for m in similar
            if m.score >= self.confidence_threshold
        ][:limit]

        return matches
```

### 7.3 Model Selection Rationale

| Model | Pros | Cons | Decision |
|-------|------|------|----------|
| **CLIP (OpenAI)** | Zero-shot, good generalization, multimodal | Large model size | **Primary choice** |
| **ResNet-50** | Proven, fast inference | Requires fine-tuning | Fallback/ensemble |
| **DINOv2** | Self-supervised, strong features | Newer, less battle-tested | Future consideration |
| **Custom CNN** | Domain-specific accuracy | Requires training data, maintenance | Not viable initially |

**Recommendation:** Start with CLIP ViT-B/32 for its zero-shot capability and strong transfer learning properties. Fine-tune on user data over time to improve accuracy for specific domains.

---

## 8. Scalability Considerations

### 8.1 Horizontal Scaling Strategy

```
                    +-------------------+
                    |   Load Balancer   |
                    |   (NGINX/ALB)     |
                    +--------+----------+
                             |
            +----------------+----------------+
            |                |                |
            v                v                v
     +-------------+  +-------------+  +-------------+
     |  API Pod 1  |  |  API Pod 2  |  |  API Pod N  |
     +-------------+  +-------------+  +-------------+
            |                |                |
            +----------------+----------------+
                             |
                    +--------v----------+
                    |   Shared Services |
                    |   - PostgreSQL    |
                    |   - Redis         |
                    |   - S3            |
                    |   - Vector DB     |
                    +-------------------+
```

### 8.2 Performance Optimization Strategies

#### Image Storage
- **Lazy loading:** Load thumbnails first, full images on demand
- **Progressive JPEG:** Render partial image while loading
- **WebP conversion:** 25-35% smaller file sizes than JPEG
- **Responsive images:** Multiple sizes for different viewports

#### Database
- **Connection pooling:** PgBouncer for connection management
- **Read replicas:** Offload search queries to replicas
- **Indexing strategy:**
  - B-tree on `images(user_id, created_at)`
  - GIN index on `image_tags(image_id, tag_id)`
  - Full-text index on `tags(name)`

#### Caching Strategy
```
Cache Layers:
+------------------+------------------+------------------+
|     Layer        |     TTL          |     Content      |
+------------------+------------------+------------------+
| Browser          | 5 minutes        | Static assets    |
| CDN              | 1 hour           | Images, thumbnails|
| Redis (query)    | 5 minutes        | Search results   |
| Redis (session)  | 24 hours         | User sessions    |
+------------------+------------------+------------------+
```

#### ML Service
- **Model quantization:** INT8 quantization for 4x faster inference
- **Batch processing:** Process multiple images per request
- **GPU acceleration:** CUDA-enabled inference for production
- **Model caching:** Keep model loaded in memory

### 8.3 Scaling Metrics & Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| API Response Time (p95) | > 500ms | Scale up API pods |
| Database Connections | > 80% utilized | Add connection pooler |
| Storage Used | > 80% capacity | Add storage volume |
| Vector DB Latency | > 200ms | Optimize index, add replicas |
| ML Inference Time | > 1s | Enable GPU, optimize model |

---

## 9. Security Considerations

### 9.1 Authentication & Authorization

```
Authentication Flow:
+--------+     +--------+     +--------+     +--------+
| Client |---->|  API   |---->| Verify |---->| Access |
|        |     | Gateway|     |  JWT   |     | Token  |
+--------+     +--------+     +--------+     +--------+
                    |
                    v
              +-----------+
              |  Redis    |
              |  (token   |
              |  blacklist)|
              +-----------+
```

### 9.2 Data Protection

| Concern | Mitigation |
|---------|------------|
| Passwords | bcrypt with cost factor 12 |
| Tokens | JWT with short expiry (15min access, 7d refresh) |
| File uploads | Virus scanning, magic byte validation |
| S3 access | Pre-signed URLs with 1-hour expiry |
| API rate limiting | Redis-based sliding window (100 req/min) |

### 9.3 Input Validation

- **File types:** Whitelist JPEG, PNG, WebP only
- **File size:** Max 10MB per image, 50MB total per upload
- **Image dimensions:** Min 100x100, Max 10000x10000
- **Tag names:** Alphanumeric + hyphens, max 50 chars
- **Angle degrees:** Must be in [0, 45, 90, 135, 180, 225, 270, 315]

---

## 10. Deployment Architecture

### 10.1 Development Environment

```yaml
# docker-compose.yml (development)
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    volumes: ["./frontend:/app"]

  api:
    build: ./api
    ports: ["4000:4000"]
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/label_camera
    volumes: ["./api:/app"]

  ml-service:
    build: ./ml-service
    ports: ["5000:5000"]
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]

  db:
    image: postgres:16
    ports: ["5432:5432"]
    volumes: ["pg_data:/var/lib/postgresql/data"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  minio:
    image: minio/minio
    ports: ["9000:9000", "9001:9001"]
    command: server /data --console-address ":9001"
```

### 10.2 Production Environment (AWS)

```
                    +--------------------------------+
                    |          AWS Cloud             |
                    +--------------------------------+
                    |                                |
                    |  +--------------------------+  |
                    |  |    CloudFront (CDN)      |  |
                    |  +------------+-------------+  |
                    |               |                |
                    |  +------------v-------------+  |
                    |  |    ALB (Load Balancer)   |  |
                    |  +------------+-------------+  |
                    |               |                |
                    |  +------------v-------------+  |
                    |  |    EKS (Kubernetes)      |  |
                    |  |  +--------+ +--------+   |  |
                    |  |  |API Pod | |ML Pod  |   |  |
                    |  |  +--------+ +--------+   |  |
                    |  +------------+-------------+  |
                    |               |                |
                    |  +------------+-------------+  |
                    |  |    RDS PostgreSQL        |  |
                    |  |    ElastiCache Redis     |  |
                    |  |    S3 (Image Storage)    |  |
                    |  |    Pinecone (Vector DB)  |  |
                    |  +--------------------------+  |
                    |                                |
                    +--------------------------------+
```

---

## 11. Monitoring & Observability

### 11.1 Metrics Collection

| Category | Metrics | Tools |
|----------|---------|-------|
| **Application** | Request rate, latency, errors | Prometheus + Grafana |
| **Infrastructure** | CPU, memory, disk, network | CloudWatch / Datadog |
| **Database** | Query time, connections, locks | pgStatStatements |
| **ML Service** | Inference time, model accuracy | Custom metrics |
| **Storage** | Bucket size, request count | S3 metrics |

### 11.2 Logging Strategy

```typescript
// Structured logging format
interface LogEntry {
  timestamp: string;      // ISO 8601
  level: 'debug' | 'info' | 'warn' | 'error';
  service: string;        // 'api' | 'ml-service' | 'frontend'
  traceId: string;        // Distributed tracing ID
  userId?: string;
  action: string;
  duration?: number;      // milliseconds
  metadata?: Record<string, unknown>;
}
```

### 11.3 Alerting Rules

| Alert | Condition | Severity |
|-------|-----------|----------|
| API Error Rate | > 5% errors | High |
| API Latency | p95 > 1s | Medium |
| Database Connections | > 90% utilized | High |
| Storage Capacity | > 85% used | Medium |
| ML Service Down | No heartbeat for 30s | Critical |

---

## 12. Future Considerations

### 12.1 Potential Enhancements

1. **Federated Learning:** Train recognition model across user devices for privacy-preserving improvement
2. **Augmented Reality:** Overlay labels on live camera feed
3. **Offline Mode:** Progressive web app with local image recognition
4. **Multi-tenant:** Support organizations with isolated data
5. **API Access:** Public API for third-party integrations

### 12.2 Technical Debt Tracking

| Area | Current State | Target State | Priority |
|------|---------------|--------------|----------|
| Test Coverage | Not specified | > 80% | High |
| Documentation | This document | API docs, runbooks | High |
| CI/CD | Not specified | Full pipeline | High |
| IaC | Docker Compose | Terraform/Pulumi | Medium |

---

## 13. Trade-offs and Decisions

### 13.1 Key Architecture Decisions

| Decision | Choice | Alternative | Rationale |
|----------|--------|-------------|-----------|
| **Backend Language** | TypeScript/Node.js | Python, Go | Shared types with frontend, async I/O, mature ecosystem |
| **Database** | PostgreSQL | MongoDB | ACID guarantees, relational data, JSONB for flexibility |
| **Vector DB** | Pinecone | Milvus, Weaviate | Managed service, proven scale, minimal ops |
| **ML Model** | CLIP | Custom CNN | Zero-shot capability, faster time-to-market |
| **Frontend** | React | Vue, Svelte | Larger ecosystem, hiring pool, component libraries |

### 13.2 Trade-off Tensions

| Tension | Impact | Resolution |
|---------|--------|------------|
| **Accuracy vs Latency** | Larger models are more accurate but slower | Start with CLIP, offer tiered service |
| **Cost vs Features** | Vector search is expensive | Cache aggressively, use approximate NN |
| **Privacy vs Accuracy** | Centralized data improves models but raises privacy concerns | Anonymize embeddings, offer local-only mode |
| **Simplicity vs Scale** | Microservices scale better but add complexity | Start monolithic, extract services as needed |

---

## 14. Glossary

| Term | Definition |
|------|------------|
| **Embedding** | Dense vector representation of an image in high-dimensional space |
| **Vector Search** | Finding similar items by comparing vector distances (e.g., cosine similarity) |
| **Zero-shot** | Model's ability to classify unseen categories without training |
| **Angle** | Rotation degree of camera when capturing multi-view photo |
| **Pre-signed URL** | Time-limited, authenticated URL for S3 object access |

---

## 15. References

- [CLIP Paper](https://arxiv.org/abs/2103.00020) - OpenAI's Contrastive Language-Image Pre-training
- [Prisma Documentation](https://www.prisma.io/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pinecone Vector Database](https://docs.pinecone.io/)
- [AWS S3 Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/optimizing-performance.html)

---

*Document maintained by: Architecture Team*
*Last updated: 2026-03-04*
