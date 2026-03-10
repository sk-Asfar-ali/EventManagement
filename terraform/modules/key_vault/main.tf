data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "this" {
  name                        = var.name
  location                    = var.location
  resource_group_name         = var.resource_group_name
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  sku_name                    = "standard"
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false
  tags                        = var.tags
}


resource "azurerm_key_vault_access_policy" "deployer" {
  key_vault_id = azurerm_key_vault.this.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = var.deployer_object_id

  secret_permissions = ["Get", "List", "Set", "Delete", "Purge"]
}


resource "azurerm_key_vault_access_policy" "vm" {
  key_vault_id = azurerm_key_vault.this.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = var.vm_principal_id

  secret_permissions = ["Get", "List"]
}

variable "name"                { type = string }
variable "resource_group_name" { type = string }
variable "location"            { type = string }
variable "vm_principal_id"     { type = string }
variable "deployer_object_id"  { type = string }
variable "tags"{
   type = map(string)
   default = {} 
   }

output "name" { value = azurerm_key_vault.this.name }
output "id"   { value = azurerm_key_vault.this.id }
