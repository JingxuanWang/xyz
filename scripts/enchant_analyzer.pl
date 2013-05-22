#!/usr/bin/perl

use strict;
use Data::Dumper;

my $PATH = "../js/lib/enchant.js";

my $class_tree = +{
	Class => +{},
};

sub loadFile {
	my ($file) = @_;
	
	open FILE, "<$file" or die "can not open file";
	while(my $line = <FILE>) {
		#print $line;
		chomp($line);

		if ($line =~ /enchant\.(.*) = enchant.Class.create\((.*)\{/) {
			my ($child, $parent) = ($1, $2);
			if ($parent =~ /enchant\.(.*),/) {
				$parent = $1;
			} else { 
				$parent = "Class";
			}
			$class_tree->{$parent}->{$child} = 1;
		}
	}
	close FILE;
}

# A BFS Print out
sub output_bfs {
	for my $class (keys %{$class_tree->{Class}}) {
		$class_tree->{Class}
	}
	my @queue = ();
	push @queue, +{name => 'Class', layer => 1};
	while (scalar(@queue) > 0) {
		my $class = shift @queue;
		print "  " x ($class->{layer} - 1), $class->{name},"\n";	
		#print "$class->{layer} : $class->{name}\n";
		
		push @queue, 
			map { +{
					name => $_, 
					layer => $class->{layer} + 1
					}
				} keys %{$class_tree->{$class->{name}}};
	}
}

sub output_dfs {
	my ($class, $depth) = @_;

	for (my $i = 1; $i < $depth; $i++) {
		print "| ";
	}
	
	if ($depth > 0) {
		print "|-";
	}
	print $class, "\n";

	return if (! defined $class_tree->{$class});
	
	for my $sub_class (keys %{$class_tree->{$class}}) {
		output_dfs($sub_class, $depth + 1);
	}
}

sub main {
	my $dHash = loadFile($PATH);
	#print Dumper $class_tree;
	output_dfs('Class', 0);
}

main();
