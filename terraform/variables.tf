variable "availability_zone" {
  description = "Availability Zone for Growcomers"
  type        = string
  default     = "ap-south-1a"
}


variable "key_pair_name" {
  description = "EC2 SSH key pair name"
  type        = string
  default     = "growcomers-key"
}