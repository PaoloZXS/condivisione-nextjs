$ErrorActionPreference = "Stop"

Write-Host "Estrazione dati Planning da SQL Server..." -ForegroundColor Green

# Load env
$env = @{}
Get-Content ".env.local" | ForEach-Object {
    $parts = $_ -split "=", 2
    if ($parts.Count -eq 2) {
        $name = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"')
        if ($name -and $value) {
            $env[$name] = $value
        }
    }
}

$Server = "ALESSIA\SQLEXPRESS"
$Database = "Assistenza"

Write-Host "Connessione a SQL Server..." -ForegroundColor Cyan

# Connection
$ConnString = "Server=$Server;Database=$Database;Integrated Security=true;"
$Conn = New-Object System.Data.SqlClient.SqlConnection($ConnString)
$Conn.Open()

Write-Host "Esecuzione query..." -ForegroundColor Cyan

$Cmd = New-Object System.Data.SqlClient.SqlCommand
$Cmd.Connection = $Conn
$Cmd.CommandTimeout = 300
$Cmd.CommandText = @"
SELECT 
    Id, Proprietario, Data, Tecnico, CodCliente, Cliente, Oggetto,
    GiornataIntera, OraInizio, OraFine, Confermato, Varie,
    eseguito, Privato
FROM Assistenza.dbo.PlanningInterventi
"@

$Reader = $Cmd.ExecuteReader()
$Rows = @()

while ($Reader.Read()) {
    $obj = @{
        id = $Reader['Id']
        Proprietario = $Reader['Proprietario']
        Data = if ($Reader['Data'] -is [DBNull]) { $null } else { $Reader['Data'].ToString().Split(' ')[0] }
        Tecnico = $Reader['Tecnico']
        CodCliente = $Reader['CodCliente']
        Cliente = $Reader['Cliente']
        Oggetto = $Reader['Oggetto']
        GiornataIntera = $Reader['GiornataIntera']
        OraInizio = $Reader['OraInizio']
        OraFine = $Reader['OraFine']
        Confermato = $Reader['Confermato']
        Varie = $Reader['Varie']
        eseguito = $Reader['eseguito']
        Privato = $Reader['Privato']
    }
    $Rows += $obj
    
    if ($Rows.Count % 2000 -eq 0) {
        Write-Host "  Lette $($Rows.Count) righe..." -ForegroundColor Gray
    }
}

$Reader.Close()
$Conn.Close()

Write-Host "Letti $($Rows.Count) appuntamenti" -ForegroundColor Green

# Save as JSON
$Rows | ConvertTo-Json | Set-Content "planning_data.json"
Write-Host "Salvato in planning_data.json" -ForegroundColor Green
Write-Host ""
Write-Host "Ora esegui: node scripts/import-planning-from-json.js" -ForegroundColor Yellow
