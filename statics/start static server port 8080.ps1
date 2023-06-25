
# Simple static http server.
Param(
    [int]$port = 8080,
    [string]$root = (Get-Location)
)

function Serve {
    $listener = [System.Net.HttpListener]::new()
    $listener.Prefixes.Add("http://localhost:$port/")
    Write-Host "Root: $root"
    try {
        $listener.Start()
        Write-Host "server started on :$port"
        while ($listener.IsListening) {
            $context = $null
            $ctxTask = $listener.GetContextAsync()
            do {
                if ($ctxTask.Wait(100)) {
                    $context = $ctxTask.Result
                }
            }
            while (-not $context)

            Handle $context
        }

    } 
    catch [System.Exception] {
        Write-Host $_
    }
    finally {
        $listener.Stop()
    }
}

function Handle([System.Net.HttpListenerContext] $context) {
    try {
        Write-Host $context.Request.RawUrl
        $path = $context.Request.RawUrl.TrimStart("/")

        if ([String]::IsNullOrWhiteSpace($path)) {
            $path = "index.html"
        }
        $path = [System.IO.Path]::Combine($root, $path)
        if ([System.IO.File]::Exists($path)) {
            $fstream = [System.IO.FileStream]::new($path, [System.IO.FileMode]::Open)
            $fstream.CopyTo($context.Response.OutputStream)
						$fstream.Close();
        } else {
            $context.Response.StatusCode = 404
        }
    }
    catch [System.Exception] {
        $context.Response.StatusCode = 500
        Write-Error $_
    }
    finally {
        $context.Response.Close()
    }
}

Serve