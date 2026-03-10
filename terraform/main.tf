terraform {
  required_version = ">= 1.6.6"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.90"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }


  backend "azurerm" {
    resource_group_name  = "RES-demo"
    storage_account_name = "eventlytfstate"   
    container_name       = "tfstatecontainer"
    key                  = "evently.terraform.tfstate"
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }
  }
}


module "resource_group" {
  source   = "./modules/resource_group"
  name     = "${var.project}-${var.environment}-rg"
  location = var.location
  tags     = local.common_tags
}


module "storage_account" {
  source              = "./modules/storage_account"
  name                = "${var.project}${var.environment}sa"
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  tags                = local.common_tags
}


module "acr" {
  source              = "./modules/acr"
  name                = "${var.project}${var.environment}acr"
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  tags                = local.common_tags
}


module "networking" {
  source              = "./modules/networking"
  project             = var.project
  environment         = var.environment
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  tags                = local.common_tags
}


module "key_vault" {
  source              = "./modules/key_vault"
  name                = "${var.project}-${var.environment}-kv"
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  
  vm_principal_id     = module.vm.principal_id
  
  deployer_object_id  = var.deployer_object_id
  tags                = local.common_tags
}


module "vm" {
  source              = "./modules/vm"
  project             = var.project
  environment         = var.environment
  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  subnet_id           = module.networking.subnet_id
  public_ip_id        = module.networking.public_ip_id
  acr_login_server    = module.acr.login_server
  key_vault_name      = module.key_vault.name
  admin_username      = var.vm_admin_username
  ssh_public_key      = var.ssh_public_key
  vm_size             = var.vm_size
  tags                = local.common_tags
}

locals {
  common_tags = {
    project     = var.project
    environment = var.environment
    managed_by  = "terraform"
  }
}
