#!/usr/bin/perl

use strict;
use warnings;

my $DIR = "image/output/";

sub parse_vector {
	my ($filename) = @_;
	
	chomp($filename);

	if ($filename =~ /^r: (\d+), g: (\d+), b: (\d+).png$/) {
		return +[$1, $2, $3];	
	}
}

sub get_vectors {
	my @filenames = `ls $DIR`;
	return map { get_vector($_) } @filenames;
}

sub dump_vectors {
	my ($vectors) = @_;

	open FILE ">vector.txt" or die "Can not open file";

	foreach my $vector (@$vectors) {
		print FILE "$vector->[0] $vector[1] $vector[2]\n";
	}

	close FILE;
}

sub main {
	@vectors = get_vectors();

	dump_vectors(\@vectors);
}

&main();
