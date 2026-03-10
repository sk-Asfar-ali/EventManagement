variable "project" {
  
  type        = string
  default     = "evently"
}

variable "environment" {
  
  type        = string
  default     = "prod"
}

variable "location" {
  
  type        = string
  default     = "Central India"
}

variable "vm_size" {
  
  type        = string
  default     = "Standard_B2ats_v2"
}

variable "vm_admin_username" {
  
  type        = string
  default     = "azureuser"
}

variable "ssh_public_key" {
  
  type        = string
  sensitive   = true
}

variable "deployer_object_id" {
  
  type        = string
}
#changed here