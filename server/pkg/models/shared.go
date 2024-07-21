package models

type HTTPError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type HTTPSuccess struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}
