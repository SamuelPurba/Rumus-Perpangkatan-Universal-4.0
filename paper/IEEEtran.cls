%% IEEEtran.cls 2015/08/26 version V1.8b
%% Official LaTeX Class file for IEEE Journals and Conferences
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{IEEEtran}[2015/08/26 V1.8b by Michael Shell]
\DeclareOption*{\PassOptionsToClass{\CurrentOption}{article}}
\ProcessOptions\relax
\LoadClass[twocolumn,10pt,letterpaper]{article}
\RequirePackage{amsmath,amssymb,amsfonts}
\RequirePackage{graphicx}
\RequirePackage{cite}
\RequirePackage{url}

\newcommand{\IEEEmembership}[1]{(#1)}
\newcommand{\markboth}[2]{}
\newcommand{\IEEEPARstart}[2]{\textbf{#1}#2}
\newenvironment{IEEEkeywords}{\textbf{Index Terms}---}{\vspace{1em}}
