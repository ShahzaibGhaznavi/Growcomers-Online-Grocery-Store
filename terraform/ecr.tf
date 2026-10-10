resource "aws_ecr_repository" "frontend" {
  name                 = "growcomers-frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "growcomers-frontend"
  }
}

resource "aws_ecr_repository" "backend" {
  name                 = "growcomers-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "growcomers-backend"
  }
}

resource "aws_ecr_repository" "python_backend" {
  name                 = "growcomers-python-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "growcomers-python-backend"
  }
}