#!/usr/bin/perl

use strict;
use Data::Dumper;
use Tree::Nary;

my $PATH = "../js/lib/arctic.js";

sub loadFile {
	my ($file) = @_;
	
	my $dHash = +{};
	my $root = new Tree::Nary();
	my $node = $root;

	my $cur_scope = "global";
	$root->{data} = "u_$cur_scope";
	#$root->{data} = + {
	#	name => $cur_scope,
	#	type => "func",
	#};
	my $nest_level = 0;

	open FILE, "<$file" or die "can not open file";
	while(my $line = <FILE>) {
		#print $line;
		chomp($line);

		next if ($line =~ /^\s*\/*\*/);

		my $nest_change = getNestChange($line);
		#$nest_level += $nest_change;

		if ($nest_change == 1) {
		} elsif ($nest_change < 0) {
			if ($node->{data} =~ /c_/ && $nest_change == -2) {
				$node = $node->{parent};
			} elsif ($node->{data} = /f_/ && $nest_change == -1) {
				$node = $node->{parent};
			}
		}

		#if ($line =~ /^\s*(var\s+){0,1}(\S*)\s*=\s*Class\.create/) {
		if ($line =~ /^\s*(var\s+){0,1}(\S*)\s*=\s*Class\.create/
		|| $line =~ /^\s*var\s+Class/) {
			# is class define
			#$new_scope = $2;
			$cur_scope = $2;
			if (!exists $dHash->{$cur_scope}) {
				$dHash->{$cur_scope} = +{};
			}
			
			my $tNode = new Tree::Nary();
			$tNode->{data} = "c_$cur_scope";
			#$tNode->{data} = +{
			#	name => $cur_scope,
			#	type => "class",
			#};
			$tNode->append($node, $tNode);
			$node = $tNode;
		} elsif ($line =~ /^\s*(\S*)\s*:\s*function/) {
			# is function define
			$cur_scope = $1;
			$cur_scope =~ s/\(.*\)//g;
			$cur_scope = "anonymous" if(!$cur_scope);
			$dHash->{$cur_scope}->{$cur_scope} = $nest_level;
			
			my $tNode = new Tree::Nary();
			$tNode->{data} = "f_$cur_scope";
			#$tNode->{data} = +{
			#	name => $cur_scope,
			#	type => "func",
			#};
			$tNode->append($node, $tNode);
			$node = $tNode;
		} elsif ($line =~ /function\s* (\S*)(\s)*\{/) {
			# is function define
			$cur_scope = $1;
			$cur_scope =~ s/\(.*\)//g;
			$cur_scope = "anonymous" if(!$cur_scope);
			$dHash->{$cur_scope}->{$cur_scope} = $nest_level;
			
			my $tNode = new Tree::Nary();
			$tNode->{data} = "f_$cur_scope";
			#$tNode->{data} = +{
			#	name => $cur_scope,
			#	type => "func",
			#};
			$tNode->append($node, $tNode);
			$node = $tNode;
		} elsif ($line =~ /^\s*(var\s+){0,1}(\S*)\s*=\s*function/) {
			# is function define
			$cur_scope = $2;
			$cur_scope =~ s/\(.*\)//g;
			$cur_scope = "anonymous" if(!$cur_scope);
			$dHash->{$cur_scope}->{$cur_scope} = $nest_level;
			
			my $tNode = new Tree::Nary();
			$tNode->{data} = "f_$cur_scope";
			#$tNode->{data} = +{
			#	name => $cur_scope,
			#	type => "func",
			#};
			$tNode->append($node, $tNode);
			$node = $tNode;
		} else {
			# do nothing
		}

	}
	close FILE;


	$root->traverse(
		$root, 
		$Tree::Nary::IN_ORDER, 
		$Tree::Nary::TRAVERSE_ALL, 
		-1, 
		sub {
			my ($ref) = @_;
			print "==========================\n";			
			print "DATA:  $ref->{data}\n";
			print "PARENT:$ref->{parent}->{data}\n";
			print "CHILD: $ref->{children}->{data}\n";
			return 0;
		}
	);
	
	#return $dHash;
}


sub getNestChange {
	my ($line) = @_;
	my $nest_level = 0;
	my @array = split('', $line);
	for my $ch (@array) {
		if ($ch eq '(' || $ch eq '{') {
			++$nest_level;
		} elsif ($ch eq ')' || $ch eq '}') {
			--$nest_level;
		}
	}
	#print STDERR "$nest_level\t $line\n" if ($nest_level < 0);
	return $nest_level;
}

sub main {
	my $dHash = loadFile($PATH);
	#print Dumper $dHash;
}

main();
