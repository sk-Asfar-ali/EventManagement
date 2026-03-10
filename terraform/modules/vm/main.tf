

resource "azurerm_network_interface" "this" {
  name                = "${var.project}-${var.environment}-nic"
  location            = var.location
  resource_group_name = var.resource_group_name
  tags                = var.tags

  ip_configuration {
    name                          = "internal"
    subnet_id                     = var.subnet_id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = var.public_ip_id
  }
}


resource "azurerm_linux_virtual_machine" "this" {
  name                = "${var.project}-${var.environment}-vm"
  location            = var.location
  resource_group_name = var.resource_group_name
  size                = var.vm_size
  admin_username      = var.admin_username
  tags                = var.tags

  network_interface_ids = [azurerm_network_interface.this.id]


  identity {
    type = "SystemAssigned"
  }

  admin_ssh_key {
    username   = var.admin_username
    public_key = var.ssh_public_key
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
    disk_size_gb         = 50   
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  
}

variable "project"             { type = string }
variable "environment"         { type = string }
variable "resource_group_name" { type = string }
variable "location"            { type = string }
variable "subnet_id"           { type = string }
variable "public_ip_id"        { type = string }
variable "acr_login_server"    { type = string }
variable "key_vault_name"      { type = string }
variable "admin_username"      { type = string }
variable "ssh_public_key"{ 
  type = string
  sensitive = true
  }
variable "vm_size"             { type = string }
variable "tags"{
   type = map(string)
   default = {} 
   }


output "principal_id" { value = azurerm_linux_virtual_machine.this.identity[0].principal_id }
output "vm_id"        { value = azurerm_linux_virtual_machine.this.id }
