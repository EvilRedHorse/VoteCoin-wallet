var {ipcRenderer, remote} = require('electron');  
var main = remote.require("./main.js");

function JSON_fromString(json)
{
   var ret={};
   try { ret=JSON.parse(json); } catch (e) { console.log(e); };
   return ret;
}


function num(n,precision)
{
   n=parseFloat(n);
   return n.toFixed(precision);
}


function msg(s)
{
   if (s=="") $('#msg').html('').hide();
   else $('#msg').text(s).show();
}


function update_totals()
{
   msg("Connecting to VoteCoin service...");
   main.rpc("z_gettotalbalance", "", (res)=>
   {
      if (res.result)
      {
         $('#transparentVOT').text(num(res.result.transparent,8));
         $('#privateVOT').text(num(res.result.private,8));
         $('#totalVOT').text(num(res.result.total,8));

         msg("Getting exchange rates from web...");
         $.get("http://votecoin.site/bestrate.php",function(rates)
         {
            rates=JSON_fromString(rates);
            $('#totalUSD').text("$"+num(res.result.total*rates.BTCUSD*rates.VOTBTC,2));
            $('#msg').hide();
            $('#progress').hide();
            $('#dashboard').show();
            isInitialized=true;
            $('.menurow').first().addClass('active');
         });
      }
   },true);
}

function download_progress(file,size,bytes)
{
   $('#progressbar').css('width',Math.ceil(bytes/size*100)+'%');
}


function init()
{
   $('#progress').show();
   $('#progressmessage').html("Downloading zkSNARK proving keys (900MB)...");

   // check && download sprout proving file
   main.download_all_files(download_progress,function()
   {
      $('#progressmessage').html("VoteCoin wallet is starting, please wait...");
      // parse votecoin.conf file, if empty set random password and write to file.

      // start wallet
      main.walletStart();

      // update totals. This re-executes itself until wallet is started and balances gathered
      update_totals();

      // start periodic checker
   });
}

init();
