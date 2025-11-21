#!/bin/bash

# Pastikan SA_PASSWORD tersedia (disediakan oleh docker-compose.yml)
if [ -z "$SA_PASSWORD" ]; then
    echo "ERROR: SA_PASSWORD environment variable not set."
    exit 1
fi

# Jalankan SQL Server di background
/opt/mssql/bin/sqlservr &
SQL_SERVER_PID=$!

# Tunggu sampai SQL Server siap menggunakan sqlcmd
echo "Waiting for SQL Server to start..."
MAX_ATTEMPTS=30
ATTEMPT=0
SUCCESS=false

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -Q "SELECT 1" -h -1 2>/dev/null
    if [ $? -eq 0 ]; then
        SUCCESS=true
        break
    fi
    echo -n "."
    sleep 5
    ATTEMPT=$((ATTEMPT + 1))
done

if [ "$SUCCESS" = true ]; then
    echo -e "\nSQL Server is up. Running init script..."
    if [ -f /sql/init.sql ]; then
        # Jalankan skrip inisialisasi
        /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -i /sql/init.sql
        if [ $? -eq 0 ]; then
            echo "Init script finished successfully."
        else
            echo "ERROR: Init script failed. Check /sql/init.sql for errors."
            # Anda bisa tambahkan 'kill $SQL_SERVER_PID' di sini jika init gagal
        fi
    fi
else
    echo -e "\nERROR: SQL Server startup failed after $MAX_ATTEMPTS attempts."
fi

# Tunggu agar PID utama (sqlservr) tetap berjalan di foreground
wait $SQL_SERVER_PID