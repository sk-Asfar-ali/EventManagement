output "vm_public_ip" {
  description = "Public IP address of the VM — use this to SSH in and to point your domain"
  value       = module.networking.public_ip_address
}

output "acr_login_server" {
  description = "ACR login server URL — set this as ACR_LOGIN_SERVER in GitHub Secrets"
  value       = module.acr.login_server
}

output "acr_admin_username" {
  description = "ACR admin username — set as ACR_USERNAME in GitHub Secrets"
  value       = module.acr.admin_username
}

output "acr_admin_password" {
  description = "ACR admin password — set as ACR_PASSWORD in GitHub Secrets"
  value       = module.acr.admin_password
  sensitive   = true
}

output "key_vault_name" {
  description = "Key Vault name — use this to add secrets via Azure Portal"
  value       = module.key_vault.name
}

output "storage_account_name" {
  description = "Storage account name for app blob storage"
  value       = module.storage_account.name
}

output "blob_container_name" {
  description = "Blob container name for app storage"
  value       = module.storage_account.container_name
}
