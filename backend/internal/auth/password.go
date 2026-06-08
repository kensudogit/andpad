// Package auth — パスワードの bcrypt ハッシュ化
package auth

import "golang.org/x/crypto/bcrypt"

// HashPassword は登録・デモユーザー修復時に DB へ保存するハッシュを生成する。
func HashPassword(password string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(b), err
}

// CheckPassword はログイン時に平文パスワードを検証する。
func CheckPassword(hash, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}
