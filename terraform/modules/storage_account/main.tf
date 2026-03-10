resource "azurerm_storage_account" "this" {
  name                     = var.name   
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"     
  min_tls_version          = "TLS1_2"
  tags                     = var.tags
}


resource "azurerm_storage_container" "app" {
  name                  = "evently-files"
  storage_account_name  = azurerm_storage_account.this.name
  container_access_type = "private"   
}

variable "name"                { type = string }
variable "resource_group_name" { type = string }
variable "location"            { type = string }
variable "tags"                { type = map(string)}

output "name"            { value = azurerm_storage_account.this.name }
output "container_name"  { value = azurerm_storage_container.app.name }
output "primary_connection_string" {
  value     = azurerm_storage_account.this.primary_connection_string
  sensitive = true
}
