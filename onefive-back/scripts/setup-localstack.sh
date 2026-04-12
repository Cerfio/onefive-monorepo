#!/bin/bash

# Script pour initialiser LocalStack avec les buckets nécessaires
echo "🚀 Initialisation de LocalStack..."

# Attendre que LocalStack soit prêt
echo "⏳ Attente de LocalStack..."
until curl -f http://localhost:4566/_localstack/health > /dev/null 2>&1; do
  echo "⏳ LocalStack n'est pas encore prêt, attente..."
  sleep 2
done

echo "✅ LocalStack est prêt !"

# Configuration AWS CLI pour LocalStack
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
export AWS_ENDPOINT_URL=http://localhost:4566

# Créer le bucket unique avec organisation par préfixes
echo "🪣 Création du bucket unique 'onefive-storage'..."
aws --endpoint-url=http://localhost:4566 s3 mb s3://onefive-storage

# Configurer le bucket pour l'accès public en lecture
echo "🔓 Configuration de l'accès public pour le bucket..."
cat > /tmp/bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::onefive-storage/*"]
    }
  ]
}
EOF

aws --endpoint-url=http://localhost:4566 s3api put-bucket-policy \
    --bucket onefive-storage \
    --policy file:///tmp/bucket-policy.json

# Désactiver le blocage de l'accès public
aws --endpoint-url=http://localhost:4566 s3api put-public-access-block \
    --bucket onefive-storage \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Configurer CORS pour permettre l'accès depuis le frontend
echo "🌐 Configuration CORS pour le bucket..."
cat > /tmp/cors-config.json <<EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag", "x-amz-version-id"],
      "MaxAgeSeconds": 3600
    }
  ]
}
EOF

aws --endpoint-url=http://localhost:4566 s3api put-bucket-cors \
    --bucket onefive-storage \
    --cors-configuration file:///tmp/cors-config.json

# Créer la structure de dossiers (optionnel, les dossiers se créent automatiquement)
echo "📁 Création de la structure de dossiers..."
echo "" | aws --endpoint-url=http://localhost:4566 s3 cp - s3://onefive-storage/avatars/.keep
echo "" | aws --endpoint-url=http://localhost:4566 s3 cp - s3://onefive-storage/covers/.keep
echo "" | aws --endpoint-url=http://localhost:4566 s3 cp - s3://onefive-storage/posts/.keep
echo "" | aws --endpoint-url=http://localhost:4566 s3 cp - s3://onefive-storage/documents/.keep
echo "" | aws --endpoint-url=http://localhost:4566 s3 cp - s3://onefive-storage/temp/.keep

# Lister le contenu du bucket
echo "📋 Structure créée :"
aws --endpoint-url=http://localhost:4566 s3 ls s3://onefive-storage/ --recursive

echo "✅ LocalStack initialisé avec succès !"
echo "🔗 Interface web : http://localhost:4566"
echo "🪣 Bucket unique avec organisation :"
echo "   📁 onefive-storage/"
echo "      ├── avatars/     (photos de profil)"
echo "      ├── covers/      (images de couverture)"
echo "      ├── posts/       (médias des posts)"
echo "      ├── documents/   (PDF, docs, présentations)"
echo "      └── temp/        (fichiers temporaires)"
