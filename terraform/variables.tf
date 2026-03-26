variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-2"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "daypoo"
}

variable "db_username" {
  description = "RDS User"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "RDS Password"
  type        = string
  sensitive   = true
}
