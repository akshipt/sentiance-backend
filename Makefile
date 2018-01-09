build:
	docker build -f docker/Dockerfile -t sentiance:backend .

deploy_ec2:
	make build
	ssh-keyscan -H 52.211.207.114 >> ~/.ssh/known_hosts
	docker save sentiance:backend | bzip2 | ssh ec2-user@52.211.207.114 'bunzip2 | docker load'
	make restart_ec2
