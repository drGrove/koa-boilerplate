FROM mysql

ENV MYSQL_IMPORT /usr/local/mysql/scripts/import.sql

ADD entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ADD import.sql /usr/local/mysql/scripts/import.sql
