#!/usr/bin/perl

use strict;
use warnings;

my $DIR = "image/output/";

sub parse_vector {
	my ($filename) = @_;
	
	chomp($filename);
	
	print $filename,"\n";
	if ($filename =~ /^r:(\d+), g:(\d+), b:(\d+).png$/) {
		return +[$1, $2, $3];	
	}
}

sub get_vectors {
	my @filenames = `ls $DIR`;
	my @vectors = map { parse_vector($_) } @filenames;
	return \@vectors;
}

sub dump_vectors {
	my ($vectors) = @_;

	open FILE, ">vector.txt" or die "Can not open file";

	for my $vector (@$vectors) {
		print FILE "$vector->[0] $vector->[1] $vector->[2]\n";1
	}

	close FILE;
}

sub main {
	my $vectors = get_vectors();

	dump_vectors($vectors);
}

&main();
