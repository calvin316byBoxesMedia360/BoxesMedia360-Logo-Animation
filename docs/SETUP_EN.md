# Setup Guide - English

**Complete Google Cloud and Vertex AI Configuration for Computational Cinematography MVP**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Cloud Project Setup](#google-cloud-project-setup)
3. [Vertex AI Configuration](#vertex-ai-configuration)
4. [Local Environment Setup](#local-environment-setup)
5. [Testing the Integration](#testing-the-integration)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ **Node.js 18.0.0 or higher** ([Download](https://nodejs.org/))
- ✅ **npm** (comes with Node.js)
- ✅ **Google Cloud Account** ([Sign up](https://cloud.google.com/))
- ✅ **Credit card** (for Google Cloud billing, free tier available)
- ✅ **Git** (optional, for version control)

### Verify Prerequisites

```bash
# Check Node.js version
node --version
# Should output: v18.0.0 or higher

# Check npm version
npm --version
# Should output: 8.0.0 or higher
```

---

## Google Cloud Project Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project details:
   - **Project name**: `computational-cinematography`
   - **Organization**: (optional)
   - **Location**: (optional)
4. Click **Create**
5. **Note your Project ID** (e.g., `computational-cinematography-12345`)

### Step 2: Enable Billing

1. In the Cloud Console, go to **Billing** → **Link a billing account**
2. Create a new billing account or select an existing one
3. Enter payment information
4. **Important**: Set up budget alerts to avoid unexpected charges
   - Go to **Billing** → **Budgets & alerts**
   - Click **Create Budget**
   - Set amount: `$100/month` (recommended for testing)
   - Enable email alerts at 50%, 90%, and 100%

### Step 3: Enable Required APIs

Run these commands in [Cloud Shell](https://shell.cloud.google.com/) or your local terminal (with `gcloud` CLI installed):

```bash
# Set your project ID
export PROJECT_ID="your-project-id-here"
gcloud config set project $PROJECT_ID

# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com

# Enable Cloud Storage API (for assets)
gcloud services enable storage-component.googleapis.com

# Enable Cloud Resource Manager API
gcloud services enable cloudresourcemanager.googleapis.com

# Verify enabled services
gcloud services list --enabled
```

**Expected output**: You should see `aiplatform.googleapis.com` in the list.

---

## Vertex AI Configuration

### Step 1: Set Up Authentication

#### Option A: Service Account (Recommended for Production)

1. **Create a Service Account**:
   ```bash
   gcloud iam service-accounts create vertex-ai-user \
     --display-name="Vertex AI User for Computational Cinematography"
   ```

2. **Grant Permissions**:
   ```bash
   gcloud projects add-iam-policy-binding $PROJECT_ID \
     --member="serviceAccount:vertex-ai-user@${PROJECT_ID}.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```

3. **Create and Download Key**:
   ```bash
   gcloud iam service-accounts keys create vertex-ai-key.json \
     --iam-account=vertex-ai-user@${PROJECT_ID}.iam.gserviceaccount.com
   ```

4. **Secure the Key**:
   ```bash
   # Move to project directory
   mv vertex-ai-key.json ~/path/to/Computational-Cinematography-MVP/
   
   # Set restrictive permissions
   chmod 600 vertex-ai-key.json
   ```

#### Option B: User Account (For Development/Testing)

```bash
# Authenticate with your Google account
gcloud auth application-default login

# Follow the browser prompts to sign in
```

### Step 2: Configure Vertex AI Region

Choose a region close to your location for lower latency:

| Region | Location | Veo 3.1 Support |
|--------|----------|-----------------|
| `us-central1` | Iowa, USA | ✅ Yes |
| `us-east4` | Virginia, USA | ✅ Yes |
| `europe-west4` | Netherlands | ✅ Yes |
| `asia-southeast1` | Singapore | ⚠️ Limited |

**Set your region**:
```bash
export VERTEX_AI_REGION="us-central1"
```

### Step 3: Request Veo 3.1 Access

**Important**: Veo 3.1 may require allowlist access.

1. Go to [Vertex AI Model Garden](https://console.cloud.google.com/vertex-ai/model-garden)
2. Search for "Veo 3.1"
3. Click **Request Access** if prompted
4. Fill out the access request form
5. Wait for approval email (usually 1-3 business days)

**Alternative**: Use Veo 2.0 (generally available) for testing:
```bash
export VEO_MODEL_VERSION="veo-2.0"
```

### Step 4: Test Vertex AI Access

```bash
# Test API call
curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  https://${VERTEX_AI_REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${VERTEX_AI_REGION}/publishers/google/models/veo-3.1:predict \
  -d '{
    "instances": [{
      "prompt": "A test video generation"
    }]
  }'
```

**Expected response**: JSON with `predictions` array (or quota error if not yet approved).

---

## Local Environment Setup

### Step 1: Clone/Navigate to Project

```bash
cd ~/path/to/Computational-Cinematography-MVP
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected output**: `added 387 packages` (may vary slightly).

### Step 3: Configure Environment Variables

1. **Copy the template**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file**:
   ```bash
   # Open in your preferred editor
   nano .env
   # or
   code .env
   ```

3. **Fill in the values**:
   ```env
   # Google Cloud Configuration
   GOOGLE_CLOUD_PROJECT_ID=your-project-id-here
   GOOGLE_CLOUD_REGION=us-central1
   
   # Vertex AI Configuration
   VERTEX_AI_MODEL=veo-3.1
   VERTEX_AI_API_ENDPOINT=https://us-central1-aiplatform.googleapis.com
   
   # Authentication
   # Option A: Service Account (recommended)
   GOOGLE_APPLICATION_CREDENTIALS=./vertex-ai-key.json
   
   # Option B: User Account (comment out if using service account)
   # GOOGLE_AUTH_TYPE=user
   
   # Optional: Performance Settings
   MAX_CONCURRENT_RENDERS=2
   RENDER_TIMEOUT_MS=300000
   ```

4. **Save and close** the file.

### Step 4: Validate Configuration

```bash
# Run validation script
npm run validate-setup
```

**Expected output**:
```
✅ Node.js version: v18.0.0 (OK)
✅ npm version: 8.0.0 (OK)
✅ Environment variables: All set
✅ Google Cloud credentials: Valid
✅ Vertex AI connection: Success
✅ Project ready!
```

---

## Testing the Integration

### Step 1: Start Development Server

```bash
npm run dev
```

**Expected output**:
```
Remotion Studio started!
View at: http://localhost:3000
```

### Step 2: Open Browser

Navigate to `http://localhost:3000` in your browser.

### Step 3: Test Basic Transition

1. In the Remotion Studio, select **"Basic Transition"** composition
2. Upload two test images as keyframes
3. Click **"Generate Transition"**
4. Wait for Vertex AI to process (may take 30-60 seconds)
5. Preview the generated transition

### Step 4: Render Test Video

```bash
npx remotion render src/index.ts basic-transition out/test.mp4
```

**Expected output**:
```
Rendering frames...
[████████████████████████████████] 100%
Video saved to: out/test.mp4
Duration: 8 seconds
Resolution: 1920x1080
```

---

## Troubleshooting

### Issue: "API key not valid"

**Solution**:
1. Verify your service account key is in the correct location
2. Check file permissions: `chmod 600 vertex-ai-key.json`
3. Ensure `GOOGLE_APPLICATION_CREDENTIALS` path is correct in `.env`

### Issue: "Quota exceeded"

**Solution**:
1. Check your Vertex AI quota: [Quotas Page](https://console.cloud.google.com/iam-admin/quotas)
2. Request quota increase if needed
3. Wait for quota reset (usually daily)

### Issue: "Model not found: veo-3.1"

**Solution**:
1. Verify you have access to Veo 3.1 (check email for approval)
2. Try using `veo-2.0` instead in `.env`
3. Ensure region supports Veo 3.1 (use `us-central1`)

### Issue: "Rendering timeout"

**Solution**:
1. Increase `RENDER_TIMEOUT_MS` in `.env`
2. Check internet connection stability
3. Verify Vertex AI service status: [Status Dashboard](https://status.cloud.google.com/)

### Issue: "Module not found"

**Solution**:
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## Next Steps

✅ **Configuration complete!** You're ready to create impossible transitions.

**Recommended next steps**:

1. 📖 Read the [API Reference](./API_REFERENCE.md) for advanced usage
2. 🎯 Try the [Basic Transition Example](../examples/basic-transition/)
3. 🚀 Explore [Advanced Examples](../examples/advanced/)
4. 📋 Review the [System Contract](../SYSTEM_CONTRACT.md) for workflows

---

## Cost Estimation

**Estimated costs for testing** (first month):

| Service | Usage | Cost |
|---------|-------|------|
| Vertex AI (Veo 3.1) | 20 videos @ 8s each | ~$100-200 |
| Cloud Storage | 10 GB | ~$0.20 |
| Networking | 50 GB egress | ~$5 |
| **Total** | | **~$105-205** |

**Tips to reduce costs**:
- Use shorter videos (4s instead of 8s)
- Delete generated videos from Cloud Storage after downloading
- Use `veo-2.0` instead of `veo-3.1` (cheaper)
- Set up budget alerts

---

## Support

**Need help?**

- 📚 Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
- 💬 Review [System Contract](../SYSTEM_CONTRACT.md)
- 📝 Check [Learning Log](../LEARNING_LOG.md) for common issues
- 🌐 [Remotion Documentation](https://www.remotion.dev/docs)
- ☁️ [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)

---

**Last Updated**: 2026-01-31

**Version**: 1.0.0
