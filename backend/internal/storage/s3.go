// Package storage はテナント別オブジェクトキーと S3 互換ストレージへのプリサインド PUT。
package storage

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/pluszero/dental-video-api/internal/config"
)

// S3 はクリニック動画アップロード用（Railway / R2 / MinIO 等の S3 API）。
type S3 struct {
	client   *s3.Client
	bucket   string
	publicURL string
}

// New は S3 互換エンドポイントのクライアントを構築する（未設定時 nil）。
func New(cfg config.Config) (*S3, error) {
	if !cfg.S3Enabled() {
		return nil, nil
	}
	resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, _ ...any) (aws.Endpoint, error) {
		if cfg.S3Endpoint != "" {
			return aws.Endpoint{URL: cfg.S3Endpoint, HostnameImmutable: true}, nil
		}
		return aws.Endpoint{}, &aws.EndpointNotFoundError{}
	})
	loaderOpts := []func(*awsconfig.LoadOptions) error{
		awsconfig.WithRegion(cfg.S3Region),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.S3AccessKey, cfg.S3SecretKey, "")),
	}
	if cfg.S3Endpoint != "" {
		loaderOpts = append(loaderOpts, awsconfig.WithEndpointResolverWithOptions(resolver))
	}
	awsCfg, err := awsconfig.LoadDefaultConfig(context.Background(), loaderOpts...)
	if err != nil {
		return nil, err
	}
	client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.UsePathStyle = cfg.S3ForcePathStyle
	})
	pub := cfg.S3PublicBaseURL
	if pub == "" && cfg.S3Endpoint != "" {
		pub = strings.TrimRight(cfg.S3Endpoint, "/") + "/" + cfg.S3Bucket
	}
	return &S3{client: client, bucket: cfg.S3Bucket, publicURL: pub}, nil
}

// ObjectKey は tenants/{orgID}/... で他テナントとキー空間を分離する。
func (s *S3) ObjectKey(orgID, folder, filename string) string {
	safe := strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' || r == '.' {
			return r
		}
		return '_'
	}, filename)
	return fmt.Sprintf("tenants/%s/%s/%d_%s", orgID, folder, time.Now().UnixNano(), safe)
}

func (s *S3) PresignPut(ctx context.Context, key, contentType string, expire time.Duration) (string, error) {
	ps := s3.NewPresignClient(s.client)
	out, err := ps.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
	}, s3.WithPresignExpires(expire))
	if err != nil {
		return "", err
	}
	return out.URL, nil
}

func (s *S3) PublicURL(key string) string {
	if s.publicURL == "" {
		return key
	}
	return strings.TrimRight(s.publicURL, "/") + "/" + key
}
